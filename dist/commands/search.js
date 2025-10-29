"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchCommand = createSearchCommand;
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const mcpClient_js_1 = require("../services/mcpClient.js");
const formatter_js_1 = require("../services/formatter.js");
function createSearchCommand() {
    const command = new commander_1.Command('search');
    command
        .description('Search for code using semantic similarity')
        .argument('<query>', 'Search query')
        .option('-r, --repos <repos...>', 'Filter by repository names')
        .option('-l, --languages <languages...>', 'Filter by programming languages')
        .option('-k, --top-k <number>', 'Number of results to return', '5')
        .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
        .action(async (query, options) => {
        const spinner = (0, ora_1.default)(formatter_js_1.Formatter.formatSpinner('Connecting to Code RAG server...')).start();
        const client = new mcpClient_js_1.MCPClient();
        try {
            await client.connect(options.serverPath);
            spinner.text = formatter_js_1.Formatter.formatSpinner('Searching code...');
            const results = await client.searchCode({
                query,
                repoNames: options.repos,
                languages: options.languages,
                topK: parseInt(options.topK),
            });
            spinner.stop();
            console.log(formatter_js_1.Formatter.formatSearchResults(results));
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
//# sourceMappingURL=search.js.map