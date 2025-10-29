#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { createSearchCommand } from './commands/search.js';
import { createChatCommand } from './commands/chat.js';
import { createStatsCommand } from './commands/stats.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('code-assistant')
  .description('CLI assistant for code exploration using RAG and MCP')
  .version('1.0.0');

// Add commands
program.addCommand(createSearchCommand());
program.addCommand(createChatCommand());
program.addCommand(createStatsCommand());

// Add ingest command
program
  .command('ingest')
  .description('Trigger repository ingestion')
  .argument('[repo-name]', 'Repository name to ingest (optional)')
  .option('-f, --force', 'Force full re-indexing')
  .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
  .action(async (repoName: string | undefined, options: any) => {
    const ora = (await import('ora')).default;
    const { MCPClient } = await import('./services/mcpClient.js');
    const { Formatter } = await import('./services/formatter.js');
    
    const spinner = ora(Formatter.formatSpinner('Connecting to Code RAG server...')).start();
    const client = new MCPClient();
    
    try {
      await client.connect(options.serverPath);
      
      if (repoName) {
        spinner.text = Formatter.formatSpinner(`Ingesting repository: ${repoName}...`);
        const result = await client.ingestRepository(repoName, options.force);
        spinner.stop();
        console.log(Formatter.formatSuccess(result));
      } else {
        spinner.text = Formatter.formatSpinner('Getting repository list...');
        // For now, just show a message - in a real implementation, 
        // you'd get the repo list and ingest all
        spinner.stop();
        console.log(Formatter.formatInfo('Please specify a repository name or implement bulk ingestion'));
      }
    } catch (error) {
      spinner.stop();
      console.error(Formatter.formatError(error as Error));
      process.exit(1);
    } finally {
      await client.disconnect();
    }
  });

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red(`Error: ${err.message}`));
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse();
