"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatsCommand = createStatsCommand;
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const mcpClient_js_1 = require("../services/mcpClient.js");
const formatter_js_1 = require("../services/formatter.js");
function createStatsCommand() {
    const command = new commander_1.Command('stats');
    command
        .description('Show repository statistics')
        .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
        .action(async (options) => {
        const spinner = (0, ora_1.default)(formatter_js_1.Formatter.formatSpinner('Connecting to Code RAG server...')).start();
        const client = new mcpClient_js_1.MCPClient();
        try {
            await client.connect(options.serverPath);
            spinner.text = formatter_js_1.Formatter.formatSpinner('Getting repository statistics...');
            const stats = await client.getRepositoryStats();
            spinner.stop();
            console.log(formatter_js_1.Formatter.formatRepositoryStats(stats));
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
//# sourceMappingURL=stats.js.map