# Codey Beaver 🦫

_Codey Beaver is a versatile CLI and Node.js toolkit for leveraging LLMs to help
with computer programming tasks._

---

## Installation

Install globally using npm:

```sh
npm install -g codeybeaver
```

This provides two global commands:

- `codey` &nbsp;—&nbsp; Main entry point for Codey Beaver
- `codeyp` &nbsp;—&nbsp; Convenience command for quickly sending prompts

---

## Usage

### **codey** - Main Command

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

  - `--buffer`  
    Buffer the LLM’s entire output before displaying it in the terminal.  
    This is useful for output that is formatted as Markdown, so you can render
    or process the complete result at once instead of streaming line by line.

    While buffering, a spinner is shown to indicate work is in progress.

    **Examples:**

    ```sh
    codey prompt --buffer "Give me a markdown-formatted README for a math library"
    echo "Write Python code for a binary search" | codey prompt --buffer
    ```

  - `--markdown`  
    Buffer the LLM's entire output and display it with Markdown and syntax
    highlighting in your terminal. This is ideal for outputs containing code,
    tables, or other formatted Markdown.

    While buffering, a spinner is shown to indicate work is in progress.  
    You do **not** need to specify `--buffer` along with `--markdown`.

    **Examples:**

    ```sh
    codey prompt --markdown "Write a Markdown example with a highlighted Python code block."
    echo "Explain closures in JavaScript with examples." | codey prompt --markdown
    ```

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

# Markdown rendering
codey --markdown "Show me a Python bubble sort function with comments."
```

---

## License

MIT

---

_Developed by Identellica LLC_ 🦫
