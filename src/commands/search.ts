import { Command } from 'commander';
import ora from 'ora';
import { MCPClient } from '../services/mcpClient.js';
import { Formatter } from '../services/formatter.js';

export function createSearchCommand(): Command {
  const command = new Command('search');
  
  command
    .description('Search for code using semantic similarity')
    .argument('<query>', 'Search query')
    .option('-r, --repos <repos...>', 'Filter by repository names')
    .option('-l, --languages <languages...>', 'Filter by programming languages')
    .option('-k, --top-k <number>', 'Number of results to return', '5')
    .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
    .action(async (query: string, options) => {
      const spinner = ora(Formatter.formatSpinner('Connecting to Code RAG server...')).start();
      
      const client = new MCPClient();
      
      try {
        await client.connect(options.serverPath);
        spinner.text = Formatter.formatSpinner('Searching code...');
        
        const results = await client.searchCode({
          query,
          repoNames: options.repos,
          languages: options.languages,
          topK: parseInt(options.topK),
        });
        
        spinner.stop();
        console.log(Formatter.formatSearchResults(results));
        
      } catch (error) {
        spinner.stop();
        console.error(Formatter.formatError(error as Error));
        process.exit(1);
      } finally {
        await client.disconnect();
      }
    });
  
  return command;
}
