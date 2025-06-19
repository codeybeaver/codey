#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { generateChatCompletionStream } from "./util/ai.js";

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
  markdown,
}: {
  prompt: string;
  buffer: boolean;
  markdown: boolean;
}) {
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

    if (markdown) {
      const spinner = ora("Waiting for response...").start();
      let output = "";
      for await (const chunk of withStreamTimeout(stream, 15000)) {
        if (chunk.choices[0]?.delta.content) {
          output += chunk.choices[0].delta.content;
        }
      }
      spinner.stop();

      // Setup marked-terminal renderer for syntax highlighting
      // @ts-ignore
      marked.setOptions({
        // @ts-ignore
        renderer: new TerminalRenderer(),
      });
      process.stdout.write(`${marked(output)}\n`);
    } else if (buffer) {
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
  .name("cdy")
  .description("Send a prompt to the LLM (via argument or stdin)")
  .argument("[input]", "Prompt text (if omitted, read from stdin)")
  .option(
    "--buffer",
    "Buffer the entire output before displaying (useful for processing the complete result)"
  )
  .option(
    "--markdown",
    "Buffer and display the output as Markdown with syntax highlighting"
  )
  .action(
    async (
      input: string | undefined,
      options: { buffer?: boolean; markdown?: boolean }
    ) => {
      let promptText: string | undefined = input;
      if (!promptText && !process.stdin.isTTY) {
        promptText = (await readStdin()).trim();
      }
      if (!promptText) {
        console.error("No input provided via stdin or as argument.");
        process.exit(1);
      }
      await handlePrompt({
        prompt: promptText,
        buffer: Boolean(options.buffer),
        markdown: Boolean(options.markdown),
      });
    }
  );

program.parse();
