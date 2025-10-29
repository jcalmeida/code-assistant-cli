import { Command } from 'commander';
import ora from 'ora';
import { MCPClient } from '../services/mcpClient.js';
import { Formatter } from '../services/formatter.js';

export function createStatsCommand(): Command {
  const command = new Command('stats');
  
  command
    .description('Show repository statistics')
    .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
    .action(async (options: any) => {
      const spinner = ora(Formatter.formatSpinner('Connecting to Code RAG server...')).start();
      
      const client = new MCPClient();
      
      try {
        await client.connect(options.serverPath);
        spinner.text = Formatter.formatSpinner('Getting repository statistics...');
        
        const stats = await client.getRepositoryStats();
        
        spinner.stop();
        console.log(Formatter.formatRepositoryStats(stats));
        
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
