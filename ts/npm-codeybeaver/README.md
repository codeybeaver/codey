# Codey Beaver 🦫

_Codey Beaver is a versatile CLI and Node.js toolkit for leveraging LLMs to help
with computer programming tasks._

---

## Installation

Install globally using npm:

```sh
npm install -g codeybeaver
```

This provides one global command:

- `codey` &nbsp;—&nbsp; Main entry point for Codey Beaver

---

## Usage

### **codey**

#### Prompt Subcommand

Send a prompt (question, request, etc.) directly to the LLM.

- **Via command-line argument:**

  ```sh
  codey prompt "What is 1 + 1?"
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "Write a Python hello world script" | codey prompt
  ```

- **Optional flags:**

  - `--model <model>`  
    Specify the LLM model to use. The default is `grok-3`.  
    You can also use `gpt-4o` or any other major model available in your OpenAI
    account or xAI account.

    **Example:**

    ```sh
    codey prompt --model gpt-4o "What is the capital of France?"
    ```

  (You can also check `codey prompt --help` for the full list of available
  options.)

#### Format Subcommand

Format and highlight Markdown input for display in the terminal. This command
wraps prose text to a maximum width of 80 characters and applies syntax
highlighting to code blocks and other Markdown elements.

- **Via command-line argument:**

  ```sh
  codey format "# Hello\n\n\`\`\`js\nconsole.log('world');\n\`\`\`"
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "# My Doc\n\n\`\`\`python\nprint('hi')\n\`\`\`" | codey format
  ```

- **Piping with `prompt` (common use case):**

  ```sh
  codey prompt "Write a Markdown tutorial on Python loops." | codey format
  ```

  While receiving piped input, a spinner is shown to indicate work is in
  progress.

  (You can also check `codey format --help` for the full list of available
  options.)

---

## Help

Run the following to see more options:

```sh
codey --help
```

---

## Example Workflows

```sh
# Simple math prompt
codey prompt "What is 2 plus 2?"

# Code generation
codey prompt "Generate a JavaScript function that reverses an array"

# Pipe input as prompt
cat my-instructions.txt | codey prompt

# Generate and format Markdown output
codey prompt "Show me a Python bubble sort function with comments in Markdown." | codey format

# Format direct Markdown input
codey format "# Quick Note\n\nThis is a short note with a code block:\n\n\`\`\`bash\necho 'Hello, World!'\n\`\`\`"
```

---

## License

MIT

---

_Developed by Identellica LLC_ 🦫
