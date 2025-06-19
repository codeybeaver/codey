#!/usr/bin/env node
import { Command } from "commander";
import z from "zod/v4";

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

program
  .command("prompt [input]")
  .description("Send a prompt to the LLM (from arg or stdin)")
  .action(async (input: string | undefined) => {
    if (input) {
      console.log("Prompt (from arg):", input);
    } else if (!process.stdin.isTTY) {
      // stdin is not a terminal => input is being piped in
      const stdinInput = await readStdin();
      if (stdinInput.length > 0) {
        console.log("Prompt (from stdin):", stdinInput);
      } else {
        console.error("No input provided via stdin or as argument.");
        process.exit(1);
      }
    } else {
      // No input at all
      console.error("No prompt input given. Use an argument or pipe input.");
      process.exit(1);
    }
  });

program.parse();
