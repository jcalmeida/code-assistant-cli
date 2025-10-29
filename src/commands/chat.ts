import { Command } from 'commander';
import ora from 'ora';
import inquirer from 'inquirer';
import { MCPClient } from '../services/mcpClient.js';
import { Formatter } from '../services/formatter.js';

export function createChatCommand(): Command {
  const command = new Command('chat');
  
  command
    .description('Chat with AI about your codebase')
    .argument('[message]', 'Initial message (if not provided, starts interactive mode)')
    .option('-r, --repos <repos...>', 'Filter by repository names')
    .option('-l, --languages <languages...>', 'Filter by programming languages')
    .option('-c, --context <number>', 'Maximum context chunks', '5')
    .option('-m, --model <model>', 'Model to use', 'claude-sonnet-4-5')
    .option('-s, --server-path <path>', 'Path to MCP server', '../windsurf-project')
    .option('-i, --interactive', 'Start interactive chat mode')
    .action(async (message: string | undefined, options: any) => {
      const spinner = ora(Formatter.formatSpinner('Connecting to Code RAG server...')).start();
      
      const client = new MCPClient();
      
      try {
        await client.connect(options.serverPath);
        spinner.stop();
        
        if (options.interactive || !message) {
          await startInteractiveChat(client, options);
        } else {
          await sendSingleMessage(client, message, options);
        }
        
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

async function sendSingleMessage(client: MCPClient, message: string, options: any): Promise<void> {
  const spinner = ora(Formatter.formatSpinner('Getting AI response...')).start();
  
  try {
    const response = await client.chatWithCode({
      message,
      repoNames: options.repos,
      languages: options.languages,
      maxContextChunks: parseInt(options.context),
      model: options.model,
    });
    
    spinner.stop();
    console.log(Formatter.formatChatResponse(response));
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

async function startInteractiveChat(client: MCPClient, options: any): Promise<void> {
  console.log(Formatter.formatInfo('Starting interactive chat mode. Type "exit" to quit.\n'));
  
  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '💬 You:',
        validate: (input: string) => input.trim().length > 0 || 'Please enter a message',
      },
    ]);
    
    if (message.toLowerCase().trim() === 'exit') {
      console.log(Formatter.formatInfo('Goodbye! 👋'));
      break;
    }
    
    const spinner = ora(Formatter.formatSpinner('Getting AI response...')).start();
    
    try {
      const response = await client.chatWithCode({
        message,
        repoNames: options.repos,
        languages: options.languages,
        maxContextChunks: parseInt(options.context),
        model: options.model,
      });
      
      spinner.stop();
      console.log(Formatter.formatChatResponse(response));
      console.log(''); // Empty line for readability
    } catch (error) {
      spinner.stop();
      console.error(Formatter.formatError(error as Error));
    }
  }
}
