"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCommand = createChatCommand;
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const mcpClient_js_1 = require("../services/mcpClient.js");
const formatter_js_1 = require("../services/formatter.js");
function createChatCommand() {
    const command = new commander_1.Command('chat');
    command
        .description('Chat with AI about your codebase')
        .argument('[message]', 'Initial message (if not provided, starts interactive mode)')
        .option('-r, --repos <repos...>', 'Filter by repository names')
        .option('-l, --languages <languages...>', 'Filter by programming languages')
        .option('-c, --context <number>', 'Maximum context chunks', '5')
        .option('-m, --model <model>', 'Model to use', 'claude-sonnet-4-5')
        .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
        .option('-i, --interactive', 'Start interactive chat mode')
        .action(async (message, options) => {
        const spinner = (0, ora_1.default)(formatter_js_1.Formatter.formatSpinner('Connecting to Code RAG server...')).start();
        const client = new mcpClient_js_1.MCPClient();
        try {
            await client.connect(options.serverPath);
            spinner.stop();
            if (options.interactive || !message) {
                await startInteractiveChat(client, options);
            }
            else {
                await sendSingleMessage(client, message, options);
            }
        }
        catch (error) {
            spinner.stop();
            console.error(formatter_js_1.Formatter.formatError(error));
            process.exit(1);
        }
        finally {
            await client.disconnect();
        }
    });
    return command;
}
async function sendSingleMessage(client, message, options) {
    const spinner = (0, ora_1.default)(formatter_js_1.Formatter.formatSpinner('Getting AI response...')).start();
    try {
        const response = await client.chatWithCode({
            message,
            repoNames: options.repos,
            languages: options.languages,
            maxContextChunks: parseInt(options.context),
            model: options.model,
        });
        spinner.stop();
        console.log(formatter_js_1.Formatter.formatChatResponse(response));
    }
    catch (error) {
        spinner.stop();
        throw error;
    }
}
async function startInteractiveChat(client, options) {
    console.log(formatter_js_1.Formatter.formatInfo('Starting interactive chat mode. Type "exit" to quit.\n'));
    while (true) {
        const { message } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'message',
                message: '💬 You:',
                validate: (input) => input.trim().length > 0 || 'Please enter a message',
            },
        ]);
        if (message.toLowerCase().trim() === 'exit') {
            console.log(formatter_js_1.Formatter.formatInfo('Goodbye! 👋'));
            break;
        }
        const spinner = (0, ora_1.default)(formatter_js_1.Formatter.formatSpinner('Getting AI response...')).start();
        try {
            const response = await client.chatWithCode({
                message,
                repoNames: options.repos,
                languages: options.languages,
                maxContextChunks: parseInt(options.context),
                model: options.model,
            });
            spinner.stop();
            console.log(formatter_js_1.Formatter.formatChatResponse(response));
            console.log(''); // Empty line for readability
        }
        catch (error) {
            spinner.stop();
            console.error(formatter_js_1.Formatter.formatError(error));
        }
    }
}
//# sourceMappingURL=chat.js.map