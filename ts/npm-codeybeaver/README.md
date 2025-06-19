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

- `cdy` &nbsp;—&nbsp; Main entry point for Codey Beaver
- `cdyp` &nbsp;—&nbsp; Convenience command for quickly sending prompts

---

## Usage

### 1. **cdy** - Main Command

#### Prompt Subcommand

Send a prompt (question, request, etc.) directed at the LLM.

- **Via command-line argument:**

  ```sh
  cdy prompt "What is 1 + 1?"
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "Write a Python hello world script" | cdy prompt
  ```

- **Optional flags:**

  - `--buffer`  
    Buffer the LLM’s entire output before displaying it in the terminal.  
    This is useful for output that is formatted as Markdown, so you can render
    or process the complete result at once instead of streaming line by line.

    While buffering, a spinner is shown to indicate work is in progress.

    **Examples:**

    ```sh
    cdy prompt --buffer "Give me a markdown-formatted README for a math library"
    echo "Write Python code for a binary search" | cdy prompt --buffer
    ```

  - `--markdown`  
    Buffer the LLM's entire output and display it with Markdown and syntax
    highlighting in your terminal. This is ideal for outputs containing code,
    tables, or other formatted Markdown.

    While buffering, a spinner is shown to indicate work is in progress.  
    You do **not** need to specify `--buffer` along with `--markdown`.

    **Examples:**

    ```sh
    cdy prompt --markdown "Write a Markdown example with a highlighted Python code block."
    echo "Explain closures in JavaScript with examples." | cdy prompt --markdown
    ```

  (You can also check `cdy prompt --help` for the full list of available
  options.)

---

## Help

Run the following to see more options:

```sh
cdy --help
cdy prompt --help
```

---

## Example Workflows

```sh
# Simple math prompt
cdyp What is 2 plus 2?

# Code generation
cdy prompt "Generate a JavaScript function that reverses an array"

# Pipe input as prompt
cat my-instructions.txt | cdy prompt
```

---

## License

MIT

---

_Developed by [Your Name or Organization]_ 🦫

```

```
