import { promises as fs } from "fs";
import { generateChatCompletionStream } from "../util/ai.js";
import { withTimeout } from "../util/async.js";
import { parseChatLogFromText } from "../util/parse.js";
import { readStdin } from "../util/stdin.js";

export async function handleSave(
  input: string | undefined,
  opts: { file: string } = { file: "codey.md" },
) {
  let promptText = input;
  if (!promptText && !process.stdin.isTTY) {
    promptText = (await readStdin()).trim();
  }
  if (!promptText) {
    console.error("No prompt supplied (argument or stdin required).");
    process.exit(1);
  }

  let fileContent = "";
  try {
    fileContent = await fs.readFile(opts.file, "utf-8");
  } catch (err: unknown) {
    // what is the error? if file exists, but we failed to read it, then we
    // should log and exist. otherwise, we will create a new file later

    // @ts-ignore:
    if (err?.code === "ENOENT") {
      // File does not exist, we will create it later
      fileContent = "";
    } else {
      console.error(`Failed to read file ${opts.file}:`, err);
      process.exit(1);
    }
  }

  fileContent += `${promptText}`;

  const { messages, settings } = parseChatLogFromText(fileContent);
  messages.push({
    role: "user",
    content: promptText,
  });

  try {
    const stream = await generateChatCompletionStream({
      messages,
      model: settings.model,
    });

    // add assistant delimiter to file content
    fileContent += `${settings.delimiterPrefix}${settings.assistantDelimiter}${settings.delimiterSuffix}`;

    for await (const textChunk of withTimeout(stream, 15_000)) {
      if (textChunk) {
        // print and also prepare to save to file
        process.stdout.write(textChunk);
        // fileContent += `\n\n${settings.delimiterPrefix}${settings.userDelimiter}${textChunk}${settings.delimiterSuffix}`;
        fileContent += textChunk;
      }
    }

    // add user delimiter to file content
    fileContent += `${settings.delimiterPrefix}${settings.userDelimiter}${settings.delimiterSuffix}`;

    process.stdout.write("\n");

    // write the updated content back to the file
    try {
      await fs.writeFile(opts.file, fileContent, "utf-8");
    } catch (writeErr) {
      console.error(`Failed to write to file ${opts.file}:`, writeErr);
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error generating chat completion:", err);
    process.exit(1);
  }
}
