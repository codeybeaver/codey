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
  (Check `cdy prompt --help` for available options specific to your
  installation.)

---

### 2. **cdyp** - Convenience Shortcut

`cdyp` is a shortcut for `cdy prompt`.  
With `cdyp`, everything after the command is treated as your prompt (no need for
quotes):

```sh
cdyp What is 1 + 1?
cdyp Write a Python hello world script
```

This is equivalent to:

```sh
cdy prompt "What is 1 + 1?"
```

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
