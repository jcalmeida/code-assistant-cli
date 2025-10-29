import chalk from 'chalk';
import { SearchResult, ChatResponse, RepositoryStats } from '../types/index.js';

export class Formatter {
  static formatSearchResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return chalk.yellow('No results found.');
    }

    const output: string[] = [];
    output.push(chalk.blue.bold(`\n🔍 Found ${results.length} results:\n`));

    results.forEach((result, index) => {
      const { chunk, score } = result;
      
      output.push(chalk.cyan.bold(`${index + 1}. ${chunk.file_path}`));
      output.push(chalk.gray(`   Repository: ${chunk.repo_name}`));
      output.push(chalk.gray(`   Lines: ${chunk.start_line}-${chunk.end_line}`));
      output.push(chalk.gray(`   Language: ${chunk.language}`));
      output.push(chalk.gray(`   Score: ${score.toFixed(3)}`));
      
      if (chunk.metadata.name) {
        output.push(chalk.gray(`   Name: ${chunk.metadata.name}`));
      }
      
      // Format code with syntax highlighting (simplified)
      const codeLines = chunk.content.split('\n');
      const displayLines = codeLines.slice(0, 10); // Show first 10 lines
      
      output.push(chalk.gray('   Code:'));
      displayLines.forEach(line => {
        output.push(chalk.white(`   │ ${line}`));
      });
      
      if (codeLines.length > 10) {
        output.push(chalk.gray(`   │ ... (${codeLines.length - 10} more lines)`));
      }
      
      output.push(''); // Empty line between results
    });

    return output.join('\n');
  }

  static formatChatResponse(response: ChatResponse): string {
    const output: string[] = [];
    
    output.push(chalk.green.bold('\n🤖 Assistant Response:\n'));
    
    // Format the main response
    const responseLines = response.response.split('\n');
    responseLines.forEach(line => {
      output.push(chalk.white(line));
    });
    
    // Format sources if available
    if (response.sources && response.sources.length > 0) {
      output.push(chalk.blue.bold('\n📚 Sources:\n'));
      
      response.sources.forEach((source, index) => {
        const { chunk, score } = source;
        output.push(
          chalk.cyan(`${index + 1}. ${chunk.file_path} `) +
          chalk.gray(`(lines ${chunk.start_line}-${chunk.end_line}) `) +
          chalk.yellow(`Score: ${score.toFixed(3)}`)
        );
      });
    }
    
    // Show model used
    output.push(chalk.gray(`\nModel: ${response.model_used}`));
    
    return output.join('\n');
  }

  static formatRepositoryStats(stats: RepositoryStats): string {
    const output: string[] = [];
    
    output.push(chalk.blue.bold('\n📊 Repository Statistics:\n'));
    
    output.push(chalk.white(`Total Chunks: ${chalk.cyan(stats.total_chunks.toLocaleString())}`));
    output.push(chalk.white(`Total Files: ${chalk.cyan(stats.total_files.toLocaleString())}`));
    output.push(chalk.white(`Total Repositories: ${chalk.cyan(stats.total_repositories.toString())}`));
    
    if (stats.languages.length > 0) {
      output.push(chalk.white(`Languages: ${chalk.cyan(stats.languages.join(', '))}`));
    }
    
    output.push(chalk.white(`Last Updated: ${chalk.cyan(stats.last_updated)}`));
    
    return output.join('\n');
  }

  static formatError(error: string | Error): string {
    const message = error instanceof Error ? error.message : error;
    return chalk.red.bold(`❌ Error: ${message}`);
  }

  static formatSuccess(message: string): string {
    return chalk.green.bold(`✅ ${message}`);
  }

  static formatWarning(message: string): string {
    return chalk.yellow.bold(`⚠️  ${message}`);
  }

  static formatInfo(message: string): string {
    return chalk.blue(`ℹ️  ${message}`);
  }

  static formatSpinner(message: string): string {
    return chalk.cyan(message);
  }
}
