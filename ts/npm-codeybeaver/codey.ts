#!/usr/bin/env node
import { Command } from "commander";
import ora, { Ora } from "ora";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { generateChatCompletionStream } from "./util/ai.js";
import prettier from "prettier";

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
    const spinner = ora("Generating response from LLM...").start();
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

    let firstChunkReceived = false;
    for await (const c of withTimeout(stream, 15_000)) {
      if (!firstChunkReceived) {
        spinner.stop();
        firstChunkReceived = true;
      }
      if (c.choices[0]?.delta.content) {
        process.stdout.write(c.choices[0].delta.content);
      }
    }
    process.stdout.write("\n");
  } catch (err) {
    console.error("Error generating chat completion:", err);
    process.exit(1);
  }
}

async function handleFormat({
  input,
}: {
  input: string;
}) {
  try {
    // Format the input Markdown with prettier to enforce max width of 80
    const formattedInput = await prettier.format(input, {
      parser: "markdown",
      printWidth: 80,
      proseWrap: "always",
    });
    process.stdout.write(`${formattedInput}\n`);
  } catch (err) {
    console.error("Error formatting input:", err);
    process.exit(1);
  }
}

async function handleColor({
  input,
}: {
  input: string;
}) {
  try {
    // Setup marked-terminal renderer for syntax highlighting
    // @ts-ignore – marked-terminal lacks full typings
    marked.setOptions({ renderer: new TerminalRenderer() });
    const renderedOutput = marked(input);
    process.stdout.write(`${renderedOutput}\n`);
  } catch (err) {
    console.error("Error colorizing input:", err);
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
  .option("--model <model>", "Model to use", "grok-3")
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
  .description("Format Markdown input with proper line wrapping (argument or stdin)")
  .action(async (input: string | undefined) => {
    let formatText = input;
    const isPiped = !process.stdin.isTTY && !input;
    if (isPiped) {
      formatText = (await readStdin()).trim();
    }
    if (!formatText) {
      console.error("No input supplied for formatting (argument or stdin required).");
      process.exit(1);
    }
    await handleFormat({
      input: formatText,
    });
  });

program
  .command("color [input]")
  .description("Apply syntax highlighting to Markdown input (argument or stdin)")
  .action(async (input: string | undefined) => {
    let colorText = input;
    const isPiped = !process.stdin.isTTY && !input;
    if (isPiped) {
      colorText = (await readStdin()).trim();
    }
    if (!colorText) {
      console.error("No input supplied for colorizing (argument or stdin required).");
      process.exit(1);
    }
    await handleColor({
      input: colorText,
    });
  });

program.parse();
