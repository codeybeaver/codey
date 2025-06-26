import { generateChatCompletionStream } from "../util/ai.js";
import { parseChatLogFromText } from "../util/parse.js";
import { readStdin } from "../util/stdin.js";

export async function handlePrompt(
  input: string,
  opts: {
    model?: string;
    chunk?: boolean;
    addDelimiters?: boolean;
  },
) {
  let promptText = input;
  if (!promptText && !process.stdin.isTTY) {
    promptText = (await readStdin()).trim();
  }
  if (!promptText) {
    console.error("No prompt supplied (argument or stdin required).");
    process.exit(1);
  }
  const { messages, settings } = parseChatLogFromText(promptText);
  try {
    const stream = await generateChatCompletionStream({
      messages,
      model: opts.model || settings.model,
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

    if (opts.addDelimiters) {
      if (opts.chunk) {
        process.stdout.write(
          `${JSON.stringify({ chunk: `${settings.delimiterPrefix}${settings.assistantDelimiter}${settings.delimiterSuffix}` })}\n`,
        );
      } else {
        process.stdout.write(
          `${settings.delimiterPrefix}${settings.assistantDelimiter}${settings.delimiterSuffix}`,
        );
      }
    }

    for await (const textChunk of withTimeout(stream, 15_000)) {
      if (textChunk) {
        // Replace 'chunk' with your desired flag or variable
        if (opts.chunk) {
          process.stdout.write(`${JSON.stringify({ chunk: textChunk })}\n`);
        } else {
          process.stdout.write(textChunk);
        }
      }
    }

    if (opts.addDelimiters) {
      if (opts.chunk) {
        process.stdout.write(
          `${JSON.stringify({ chunk: `${settings.delimiterPrefix}${settings.userDelimiter}${settings.delimiterSuffix}` })}\n`,
        );
      } else {
        process.stdout.write(
          `${settings.delimiterPrefix}${settings.userDelimiter}${settings.delimiterSuffix}`,
        );
      }
    }

    if (!opts.chunk) {
      process.stdout.write("\n");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error generating chat completion:", err);
    process.exit(1);
  }
}
