# Codey 🦫

<img src="./raw-images/codeybeaver-3.png" width="150" height="150" alt="Codey Beaver">

_Codey is a versatile CLI and Node.js toolkit for leveraging LLMs to help with
computer programming tasks._

---

## Installation

Install globally using npm:

```sh
npm install -g @codeybeaver/codey
```

This provides one global command:

- `codey` &nbsp;—&nbsp; Main entry point for Codey

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

#### Buffer Subcommand

Buffer input from a previous command or direct input, showing a spinner while
waiting for the input to complete. This is useful for providing visual feedback
during long operations like LLM responses before further processing.

- **Via command-line argument:**

  ```sh
  codey buffer "Some text to buffer."
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "Some text input." | codey buffer
  ```

- **Piping with `prompt` (common use case):**

  ```sh
  codey prompt "Write a detailed Markdown tutorial on Python loops." | codey buffer
  ```

  While receiving piped input, a spinner is shown to indicate work is in
  progress.

  (You can also check `codey buffer --help` for the full list of available
  options.)

#### Format Subcommand

Format Markdown input to ensure proper line wrapping and cleanup. This command
wraps prose text to a maximum width of 80 characters for readability.

- **Via command-line argument:**

  ```sh
  codey format "# Hello\n\nThis is a long line that will be wrapped at 80 characters for readability in Markdown format."
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "# My Doc\n\nThis is a long line needing wrapping." | codey format
  ```

- **Piping with `prompt` or `buffer` (common use case):**

  ```sh
  codey prompt "Write a Markdown tutorial on Python loops." | codey buffer | codey format
  ```

  (You can also check `codey format --help` for the full list of available
  options.)

#### Color Subcommand

Apply syntax highlighting to Markdown input for display in the terminal. This
command renders Markdown with colorized code blocks and formatting elements.

- **Via command-line argument:**

  ```sh
  codey color "# Hello\n\n\`\`\`js\nconsole.log('world');\n\`\`\`"
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "# My Doc\n\n\`\`\`python\nprint('hi')\n\`\`\`" | codey color
  ```

- **Piping with `prompt`, `buffer`, or `format` (common use case):**

  ```sh
  codey prompt "Write a Markdown tutorial on Python loops." | codey buffer | codey format | codey color
  ```

  (You can also check `codey color --help` for the full list of available
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

# Generate, buffer, format, and colorize Markdown output
codey prompt "Show me a Python bubble sort function with comments in Markdown." | codey buffer | codey format | codey color

# Buffer and format direct Markdown input
echo "# Quick Note\n\nThis is a short note with a code block:\n\n\`\`\`bash\necho 'Hello, World!'\n\`\`\`" | codey buffer | codey format

# Format and colorize without buffering
codey prompt "Write a short Markdown note." | codey format | codey color
```

---

## License

MIT

---

_Developed by Identellica LLC_ 🦫
