import { Command } from "commander";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { handleBuffer } from "./commands/buffer.js";
import { handleFormat } from "./commands/format.js";
import { handlePrompt } from "./commands/prompt.js";
import { models, providers } from "./util/ai.js";
import { readStdin } from "./util/stdin.js";

const program = new Command();

/* ───────────────────────────────────────────────────── Helpers ──────────── */

async function handleColor({ input }: { input: string }) {
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
  .action(
    async (
      input: string | undefined,
      opts: { model?: string; chunk?: boolean; addDelimiters?: boolean },
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
        model: opts.model,
        chunk: opts.chunk,
        addDelimiters: opts.addDelimiters,
      });
    },
  );

program
  .command("models")
  .description("List available models")
  .action(() => {
    for (const model of models) {
      console.log(`- ${model}`);
    }
  });

program
  .command("providers")
  .description("List available providers")
  .action(() => {
    for (const provider of providers) {
      console.log(`- ${provider}`);
    }
  });

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
  .action(async (input: string | undefined) => {
    await handleFormat({ input });
  });

program
  .command("color [input]")
  .description(
    "Apply syntax highlighting to Markdown input (argument or stdin)",
  )
  .action(async (input: string | undefined) => {
    let colorText = input;
    const isPiped = !process.stdin.isTTY && !input;
    if (isPiped) {
      colorText = (await readStdin()).trim();
    }
    if (!colorText) {
      console.error(
        "No input supplied for colorizing (argument or stdin required).",
      );
      process.exit(1);
    }
    await handleColor({
      input: colorText,
    });
  });

program
  .command("beaver")
  .description("Meet Codey Beaver")
  .action(() => {
    console.log(`
                           .-++*******++-.                                      
                        .+***#############*+.                                   
                      .+*##**#####*##########*++==++*%%**++++=.                 
                     =**##***######*##########****#%%%%%******++=:              
                   :*######***################****###*++====+=***+++-           
                  -#####*****#################****#**+============+++*:         
                 :*#####*****########*######*********++++++++++===+==+.         
                 *########*****##%%#*****##****************+***+++=+=.          
                =##########*****###%##**###*#******+**#####*******+             
                #%%%%#%%####******###########*********##%##**=:.                
               :#%%%%%%%%%#####****##########*##******##%#=                     
               *#%%%%%%%%%%%####***#######%##########**##=                      
              =###%%%%%%%%%%%%####*#%%##%%%%########*###=                       
             -*####%%%@@%%%%%%######%%%%%%%%%%%######%%%:                       
           .=**####%%%@@@@%%%%##%#%@@%%%%%@%%##%%####%@%+                       
        -+********#%%@@@@@@%%%%%%%@@@@@@%+:....=#%%#*-#%##*+:                   
     -+*******++=--=+*#%%@@%%%%#########*+===--::=%#**##*=::.                   
   :++****++++-..        ..:==+++++++=+==:         ..::..                       
    .::::..                                                                     

"Hey there! I'm Codey Beaver, the hardest-working coder in the dam! I chew
through bugs and build robust code structures. Let's gnaw on some problems
together!"
    `);
  });

export { program };
