"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class Formatter {
    static formatSearchResults(results) {
        if (results.length === 0) {
            return chalk_1.default.yellow('No results found.');
        }
        const output = [];
        output.push(chalk_1.default.blue.bold(`\n🔍 Found ${results.length} results:\n`));
        results.forEach((result, index) => {
            const { chunk, score } = result;
            output.push(chalk_1.default.cyan.bold(`${index + 1}. ${chunk.file_path}`));
            output.push(chalk_1.default.gray(`   Repository: ${chunk.repo_name}`));
            output.push(chalk_1.default.gray(`   Lines: ${chunk.start_line}-${chunk.end_line}`));
            output.push(chalk_1.default.gray(`   Language: ${chunk.language}`));
            output.push(chalk_1.default.gray(`   Score: ${score.toFixed(3)}`));
            if (chunk.metadata.name) {
                output.push(chalk_1.default.gray(`   Name: ${chunk.metadata.name}`));
            }
            // Format code with syntax highlighting (simplified)
            const codeLines = chunk.content.split('\n');
            const displayLines = codeLines.slice(0, 10); // Show first 10 lines
            output.push(chalk_1.default.gray('   Code:'));
            displayLines.forEach(line => {
                output.push(chalk_1.default.white(`   │ ${line}`));
            });
            if (codeLines.length > 10) {
                output.push(chalk_1.default.gray(`   │ ... (${codeLines.length - 10} more lines)`));
            }
            output.push(''); // Empty line between results
        });
        return output.join('\n');
    }
    static formatChatResponse(response) {
        const output = [];
        output.push(chalk_1.default.green.bold('\n🤖 Assistant Response:\n'));
        // Format the main response
        const responseLines = response.response.split('\n');
        responseLines.forEach(line => {
            output.push(chalk_1.default.white(line));
        });
        // Format sources if available
        if (response.sources && response.sources.length > 0) {
            output.push(chalk_1.default.blue.bold('\n📚 Sources:\n'));
            response.sources.forEach((source, index) => {
                const { chunk, score } = source;
                output.push(chalk_1.default.cyan(`${index + 1}. ${chunk.file_path} `) +
                    chalk_1.default.gray(`(lines ${chunk.start_line}-${chunk.end_line}) `) +
                    chalk_1.default.yellow(`Score: ${score.toFixed(3)}`));
            });
        }
        // Show model used
        output.push(chalk_1.default.gray(`\nModel: ${response.model_used}`));
        return output.join('\n');
    }
    static formatRepositoryStats(stats) {
        const output = [];
        output.push(chalk_1.default.blue.bold('\n📊 Repository Statistics:\n'));
        output.push(chalk_1.default.white(`Total Chunks: ${chalk_1.default.cyan(stats.total_chunks.toLocaleString())}`));
        output.push(chalk_1.default.white(`Total Files: ${chalk_1.default.cyan(stats.total_files.toLocaleString())}`));
        output.push(chalk_1.default.white(`Total Repositories: ${chalk_1.default.cyan(stats.total_repositories.toString())}`));
        if (stats.languages.length > 0) {
            output.push(chalk_1.default.white(`Languages: ${chalk_1.default.cyan(stats.languages.join(', '))}`));
        }
        output.push(chalk_1.default.white(`Last Updated: ${chalk_1.default.cyan(stats.last_updated)}`));
        return output.join('\n');
    }
    static formatError(error) {
        const message = error instanceof Error ? error.message : error;
        return chalk_1.default.red.bold(`❌ Error: ${message}`);
    }
    static formatSuccess(message) {
        return chalk_1.default.green.bold(`✅ ${message}`);
    }
    static formatWarning(message) {
        return chalk_1.default.yellow.bold(`⚠️  ${message}`);
    }
    static formatInfo(message) {
        return chalk_1.default.blue(`ℹ️  ${message}`);
    }
    static formatSpinner(message) {
        return chalk_1.default.cyan(message);
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=formatter.js.map