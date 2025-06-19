import { Command } from 'commander';
const program = new Command();
program
    .name('cdy')
    .version('0.1.0')
    .option('-p, --prompt <text>', 'Prompt to send to the LLM');
program.parse();
// Get the parsed options
const options = program.opts();
if (options.prompt) {
    console.log('Prompt:', options.prompt);
}
else {
    console.log('No prompt provided.');
}
