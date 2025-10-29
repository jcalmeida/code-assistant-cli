import { SearchResult, ChatResponse, RepositoryStats, SearchOptions, ChatOptions } from '../types/index.js';
export declare class MCPClient {
    private client;
    private transport;
    private serverProcess;
    private isConnected;
    constructor();
    connect(serverPath?: string): Promise<void>;
    disconnect(): Promise<void>;
    searchCode(options: SearchOptions): Promise<SearchResult[]>;
    chatWithCode(options: ChatOptions): Promise<ChatResponse>;
    getRepositoryStats(): Promise<RepositoryStats>;
    ingestRepository(repoName: string, force?: boolean): Promise<string>;
    private parseSearchResults;
    private parseChatResponse;
    private parseStatsResponse;
}
//# sourceMappingURL=mcpClient.d.ts.map