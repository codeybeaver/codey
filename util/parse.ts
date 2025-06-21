export function parseChatLog(
  text: string,
  settings: {
    delimiterPrefix: string;
    delimiterSuffix: string;
    userDelimiter: string;
    assistantDelimiter: string;
    systemDelimiter: string;
  },
): { role: "user" | "assistant" | "system"; content: string }[] {
  const {
    delimiterPrefix,
    delimiterSuffix,
    userDelimiter,
    assistantDelimiter,
    systemDelimiter,
  } = settings;

  const delimiters = [
    {
      role: "user",
      delim: `${delimiterPrefix}${userDelimiter}${delimiterSuffix}`,
    },
    {
      role: "assistant",
      delim: `${delimiterPrefix}${assistantDelimiter}${delimiterSuffix}`,
    },
    {
      role: "system",
      delim: `${delimiterPrefix}${systemDelimiter}${delimiterSuffix}`,
    },
  ];

  // Build a regex to match any delimiter
  const delimRegex = new RegExp(
    `(${delimiters.map((d) => d.delim.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );

  // Split text into blocks and delimiters
  const parts = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(delimRegex, "g");

  match = regex.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push({ content: text.slice(lastIndex, match.index), delim: null });
    }
    parts.push({ content: "", delim: match[0] });
    lastIndex = regex.lastIndex;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push({ content: text.slice(lastIndex), delim: null });
  }

  // Now, walk through parts and assign roles
  const chatLog: { role: "user" | "assistant" | "system"; content: string }[] =
    [];
  let currentRole: "user" | "assistant" | "system" = "user";
  let first = true;
  for (let i = 0; i < parts.length; i++) {
    const { content, delim } = parts[i] as {
      content: string;
      delim: string | null;
    };
    if (first) {
      // If first block is empty or whitespace, and next is a system delimiter, treat as system
      if (
        content.trim().length === 0 &&
        parts[i + 1]?.delim ===
          `${delimiterPrefix}${systemDelimiter}${delimiterSuffix}`
      ) {
        currentRole = "system";
        first = false;
        continue;
      }
      // Otherwise, first block is user
      if (content.trim().length > 0) {
        chatLog.push({ role: "user", content: content });
      }
      first = false;
      continue;
    }
    if (delim) {
      // Find which role this delimiter is for
      const found = delimiters.find((d) => d.delim === delim);
      if (found) {
        currentRole = found.role as "user" | "assistant" | "system";
      }
      // Next part (if any) is the content for this role
      if (
        parts[i + 1] &&
        (
          parts[i + 1] as { content: string; delim: string | null }
        ).content.trim().length > 0
      ) {
        chatLog.push({
          role: currentRole,
          content: (parts[i + 1] as { content: string; delim: string | null })
            .content,
        });
      }
    }
  }
  return chatLog;
}
