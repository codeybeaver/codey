import { Command } from "commander";
import { handleBuffer } from "./commands/buffer.js";
import { handleColor } from "./commands/color.js";
import { handleFormat } from "./commands/format.js";
import { handleModels } from "./commands/models.js";
import { handlePrompt } from "./commands/prompt.js";
import { handleProviders } from "./commands/providers.js";

const program = new Command();

program
  .name("codey")
  .description("Codey: LLM-powered coding assistant")
  .version("0.1.1");

program
  .command("prompt")
  .argument(
    "[input]",
    "Prompt text to send to the LLM (optional; can be piped)",
  )
  .description("Send a prompt to the LLM (argument or stdin)")
  .option("--model <model>", "Model to use", "grok-3")
  .option("--chunk", "Put each chunk in a JSON object on a new line", false)
  .option("--add-delimiters", "Add delimiters to the response", false)
  .action(handlePrompt);

program
  .command("models")
  .description("List available models")
  .action(handleModels);

program
  .command("providers")
  .description("List available providers")
  .action(handleProviders);

program
  .command("buffer [input]")
  .description(
    "Buffer input and show a spinner while waiting (argument or stdin)",
  )
  .action(async (input: string | undefined) => {
    await handleBuffer({ input });
  });

program
  .command("format [input]")
  .description(
    "Format Markdown input with proper line wrapping (argument or stdin)",
  )
  .action(handleFormat);

program
  .command("color")
  .argument("[input]", "Markdown input to colorize (optional; can be piped)")
  .description(
    "Apply syntax highlighting to Markdown input (argument or stdin)",
  )
  .action(handleColor);

export { program };
