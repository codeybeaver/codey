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
  buffer,
  markdown,
  model,
}: {
  prompt: string;
  buffer: boolean;
  markdown: boolean;
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

    if (markdown) {
      const spinner = ora("Waiting for response…").start();
      let out = "";
      for await (const c of withTimeout(stream, 15_000)) {
        if (c.choices[0]?.delta.content) {
          out += c.choices[0].delta.content;
        }
      }
      spinner.stop();
      // @ts-ignore – marked-terminal lacks full typings
      marked.setOptions({ renderer: new TerminalRenderer() });
      process.stdout.write(`${marked(out)}\n`);
    } else if (buffer) {
      const spinner = ora("Waiting for response…").start();
      let out = "";
      for await (const c of withTimeout(stream, 15_000)) {
        if (c.choices[0]?.delta.content) {
          out += c.choices[0].delta.content;
        }
      }
      spinner.stop();
      process.stdout.write(`${out}\n`);
    } else {
      for await (const c of withTimeout(stream, 15_000)) {
        if (c.choices[0]?.delta.content) {
          process.stdout.write(c.choices[0].delta.content);
        }
      }
      process.stdout.write("\n");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error generating chat completion:", err);
    process.exit(1);
  }
}

/* ──────────────────────────────────────────── CLI definition ────────────── */

program
  .name("codey")
  .description("Codey Beaver CLI – LLM-powered coding assistant")
  .version("0.1.0");

/* prompt sub-command (restored) */
program
  .command("prompt [input]")
  .description("Send a prompt to the LLM (argument or stdin)")
  .option("--buffer", "Buffer full output before printing")
  .option("--markdown", "Buffer + render as Markdown with syntax highlighting")
  .option("--model <model>", "Model to use (default: grok-3)", "grok-3")
  .action(
    async (
      input: string | undefined,
      opts: { buffer?: boolean; markdown?: boolean; model: string },
    ) => {
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
        buffer: !!opts.buffer,
        markdown: !!opts.markdown,
        model: opts.model || "grok-3",
      });
    },
  );

program.parse();
