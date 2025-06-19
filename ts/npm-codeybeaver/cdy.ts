#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import { generateChatCompletionStream } from "./util/ai.js";
// import { marked } from "marked"; // <-- for future markdown rendering

const program = new Command();

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    process.stdin.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    process.stdin.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8").trim()),
    );
    process.stdin.on("error", reject);
  });
}

async function handlePrompt({
  prompt,
  buffer,
}: { prompt: string; buffer: boolean }) {
  try {
    const stream = await generateChatCompletionStream({
      messages: [
        {
          role: "user" as const,
          content: prompt,
        },
      ],
      model: "grok-3",
    });

    async function* withStreamTimeout<T>(
      stream: AsyncIterable<T>,
      ms: number,
    ): AsyncIterable<T> {
      for await (const chunkPromise of stream) {
        yield await Promise.race([
          Promise.resolve(chunkPromise),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Chunk timeout")), ms),
          ),
        ]);
      }
    }

    if (buffer) {
      const spinner = ora("Waiting for response...").start();
      let output = "";
      for await (const chunk of withStreamTimeout(stream, 15000)) {
        if (chunk.choices[0]?.delta.content) {
          output += chunk.choices[0].delta.content;
        }
      }
      spinner.stop();
      process.stdout.write(`${output}\n`);
    } else {
      for await (const chunk of withStreamTimeout(stream, 15000)) {
        if (chunk.choices[0]?.delta.content) {
          process.stdout.write(chunk.choices[0].delta.content);
        }
      }
      process.stdout.write("\n");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error generating chat completion:", error);
    process.exit(1);
  }
}

program
  .command("prompt [input]")
  .description("Send a prompt to the LLM (from arg or stdin)")
  .option(
    "--buffer",
    "Buffer the entire output before displaying (useful for markdown rendering)",
  )
  .action(async (input: string | undefined, options: { buffer?: boolean }) => {
    let promptText: string | undefined = input;
    if (!promptText && !process.stdin.isTTY) {
      // stdin is not a terminal => input is being piped in
      promptText = (await readStdin()).trim();
    }
    if (!promptText) {
      console.error("No input provided via stdin or as argument.");
      process.exit(1);
    }
    await handlePrompt({ prompt: promptText, buffer: !!options.buffer });
  });

program.parse();
