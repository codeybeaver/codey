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

### **cdy** - Main Command

Send a prompt (question, request, etc.) directly to the LLM.

- **Via command-line argument:**

  ```sh
  cdy "What is 1 + 1?"
  ```

- **Via standard input (pipe support):**

  ```sh
  echo "Write a Python hello world script" | cdy
  ```

- **Optional flags:**

  - `--buffer`  
    Buffer the LLM’s entire output before displaying it in the terminal.  
    This is useful for output that is formatted as Markdown, so you can render
    or process the complete result at once instead of streaming line by line.

    While buffering, a spinner is shown to indicate work is in progress.

    **Examples:**

    ```sh
    cdy --buffer "Give me a markdown-formatted README for a math library"
    echo "Write Python code for a binary search" | cdy --buffer
    ```

  - `--markdown`  
    Buffer the LLM's entire output and display it with Markdown and syntax
    highlighting in your terminal. This is ideal for outputs containing code,
    tables, or other formatted Markdown.

    While buffering, a spinner is shown to indicate work is in progress.  
    You do **not** need to specify `--buffer` along with `--markdown`.

    **Examples:**

    ```sh
    cdy --markdown "Write a Markdown example with a highlighted Python code block."
    echo "Explain closures in JavaScript with examples." | cdy --markdown
    ```

  - `model <model>`  
    Specify the LLM model to use. The default is `grok-3`.  
    You can also use `gpt-4o` or any other major model available in your OpenAI account or xAI account.

    **Example:**

    ```sh
    cdy --model gpt-4o "What is the capital of France?"
    ```

  (You can also check `cdy --help` for the full list of available options.)

---

## **cdyp** - Convenience Shortcut

`cdyp` is a shortcut for `cdy`. With `cdyp`, everything after the command is
treated as your prompt (no need for quotes):

```sh
cdyp What is 2 plus 2?
cdyp Generate a bash script that prints the current date
```

---

## Help

Run the following to see more options:

```sh
cdy --help
```

---

## Example Workflows

```sh
# Simple math prompt
cdy "What is 2 plus 2?"

# Code generation
cdy "Generate a JavaScript function that reverses an array"

# Pipe input as prompt
cat my-instructions.txt | cdy

# Markdown rendering
cdy --markdown "Show me a Python bubble sort function with comments."
```

---

## License

MIT

---

_Developed by Identellica LLC_ 🦫
