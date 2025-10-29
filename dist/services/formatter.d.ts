import { SearchResult, ChatResponse, RepositoryStats } from '../types/index.js';
export declare class Formatter {
    static formatSearchResults(results: SearchResult[]): string;
    static formatChatResponse(response: ChatResponse): string;
    static formatRepositoryStats(stats: RepositoryStats): string;
    static formatError(error: string | Error): string;
    static formatSuccess(message: string): string;
    static formatWarning(message: string): string;
    static formatInfo(message: string): string;
    static formatSpinner(message: string): string;
}
//# sourceMappingURL=formatter.d.ts.map