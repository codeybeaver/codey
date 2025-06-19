#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("cdy")
  .description("Codey Beaver CLI: An LLM-powered programming assistant")
  .version("0.1.0");

// Define the `prompt` subcommand
program
  .command("prompt <text>")
  .description("Send a prompt to the LLM")
  .option("-m, --model <model>", "Choose an LLM backend/model")
  .action((text: string, options: { model?: string }) => {
    console.log("Prompt:", text);
    if (options.model) {
      console.log("Model:", options.model);
    }
  });

program.parse();
