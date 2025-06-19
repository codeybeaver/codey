#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { generateChatCompletionStream } from "./util/ai.js";

const program = new Command();

/* ───────────────────────────────────────────────────── Helpers ──────────── */

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    process.stdin.on("data", (c) => chunks.push(Buffer.from(c)));
    process.stdin.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8").trim()),
    );
    process.stdin.on("error", reject);
  });
}

async function handlePrompt({
  prompt,
  model,
}: {
  prompt: string;
  model: string;
}) {
  try {
    const stream = await generateChatCompletionStream({
      messages: [{ role: "user" as const, content: prompt }],
      model,
    });

    async function* withTimeout<T>(
      src: AsyncIterable<T>,
      ms: number,
    ): AsyncIterable<T> {
      for await (const chunk of src) {
        yield await Promise.race([
          Promise.resolve(chunk),
          new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error("Chunk timeout")), ms),
          ),
        ]);
      }
    }

    for await (const c of withTimeout(stream, 15_000)) {
      if (c.choices[0]?.delta.content) {
        process.stdout.write(c.choices[0].delta.content);
      }
    }
    process.stdout.write("\n");
    process.exit(0);
  } catch (err) {
    console.error("Error generating chat completion:", err);
    process.exit(1);
  }
}

async function handleFormat({
  input,
  isPiped,
}: {
  input: string;
  isPiped: boolean;
}) {
  try {
    let spinner: ReturnType<typeof ora> | undefined;
    if (isPiped) {
      spinner = ora("Receiving and formatting input...").start();
    }
    // Setup marked-terminal renderer for syntax highlighting
    // @ts-ignore – marked-terminal lacks full typings
    marked.setOptions({ renderer: new TerminalRenderer() });
    const formattedOutput = marked(input);
    if (spinner) {
      spinner.stop();
    }
    process.stdout.write(`${formattedOutput}\n`);
    process.exit(0);
  } catch (err) {
    console.error("Error formatting input:", err);
    process.exit(1);
  }
}

/* ──────────────────────────────────────────── CLI definition ────────────── */

program
  .name("codey")
  .description("Codey Beaver CLI – LLM-powered coding assistant")
  .version("0.1.0");

program
  .command("prompt [input]")
  .description("Send a prompt to the LLM (argument or stdin)")
  .option("--model <model>", "Model to use (default: grok-3)", "grok-3")
  .action(async (input: string | undefined, opts: { model: string }) => {
    let promptText = input;
    if (!promptText && !process.stdin.isTTY) {
      promptText = (await readStdin()).trim();
    }
    if (!promptText) {
      console.error("No prompt supplied (argument or stdin required).");
      process.exit(1);
    }
    await handlePrompt({
      prompt: promptText,
      model: opts.model || "grok-3",
    });
  });

program
  .command("format [input]")
  .description("Format and highlight Markdown input (argument or stdin)")
  .action(async (input: string | undefined) => {
    let formatText = input;
    const isPiped = !process.stdin.isTTY && !input;
    if (isPiped) {
      const spinner = ora("Receiving input...").start();
      formatText = (await readStdin()).trim();
      spinner.text = "Formatting input...";
      spinner.stop();
    }
    if (!formatText) {
      console.error(
        "No input supplied for formatting (argument or stdin required).",
      );
      process.exit(1);
    }
    await handleFormat({
      input: formatText,
      isPiped,
    });
  });

program.parse();
