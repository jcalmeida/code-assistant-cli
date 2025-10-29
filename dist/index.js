#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const dotenv_1 = __importDefault(require("dotenv"));
const search_js_1 = require("./commands/search.js");
const chat_js_1 = require("./commands/chat.js");
const stats_js_1 = require("./commands/stats.js");
// Load environment variables
dotenv_1.default.config();
const program = new commander_1.Command();
program
    .name('code-assistant')
    .description('CLI assistant for code exploration using RAG and MCP')
    .version('1.0.0');
// Add commands
program.addCommand((0, search_js_1.createSearchCommand)());
program.addCommand((0, chat_js_1.createChatCommand)());
program.addCommand((0, stats_js_1.createStatsCommand)());
// Add ingest command
program
    .command('ingest')
    .description('Trigger repository ingestion')
    .argument('[repo-name]', 'Repository name to ingest (optional)')
    .option('-f, --force', 'Force full re-indexing')
    .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
    .action(async (repoName, options) => {
    const ora = (await Promise.resolve().then(() => __importStar(require('ora')))).default;
    const { MCPClient } = await Promise.resolve().then(() => __importStar(require('./services/mcpClient.js')));
    const { Formatter } = await Promise.resolve().then(() => __importStar(require('./services/formatter.js')));
    const spinner = ora(Formatter.formatSpinner('Connecting to Code RAG server...')).start();
    const client = new MCPClient();
    try {
        await client.connect(options.serverPath);
        if (repoName) {
            spinner.text = Formatter.formatSpinner(`Ingesting repository: ${repoName}...`);
            const result = await client.ingestRepository(repoName, options.force);
            spinner.stop();
            console.log(Formatter.formatSuccess(result));
        }
        else {
            spinner.text = Formatter.formatSpinner('Getting repository list...');
            // For now, just show a message - in a real implementation, 
            // you'd get the repo list and ingest all
            spinner.stop();
            console.log(Formatter.formatInfo('Please specify a repository name or implement bulk ingestion'));
        }
    }
    catch (error) {
        spinner.stop();
        console.error(Formatter.formatError(error));
        process.exit(1);
    }
    finally {
        await client.disconnect();
    }
});
// Global error handler
program.exitOverride((err) => {
    if (err.code === 'commander.help') {
        process.exit(0);
    }
    console.error(chalk_1.default.red(`Error: ${err.message}`));
    process.exit(1);
});
// Show help if no command provided
if (process.argv.length <= 2) {
    program.help();
}
program.parse();
//# sourceMappingURL=index.js.map