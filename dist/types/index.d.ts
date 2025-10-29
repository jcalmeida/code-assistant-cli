export interface SearchResult {
    chunk: {
        id: string;
        repo_name: string;
        file_path: string;
        language: string;
        content: string;
        start_line: number;
        end_line: number;
        chunk_type: string;
        metadata: {
            name?: string;
            context?: string;
        };
    };
    score: number;
}
export interface ChatResponse {
    response: string;
    sources: SearchResult[];
    model_used: string;
}
export interface RepositoryStats {
    total_chunks: number;
    total_files: number;
    total_repositories: number;
    languages: string[];
    last_updated: string;
}
export interface SearchOptions {
    query: string;
    repoNames?: string[];
    languages?: string[];
    topK?: number;
}
export interface ChatOptions {
    message: string;
    repoNames?: string[];
    languages?: string[];
    maxContextChunks?: number;
    model?: string;
}
export interface Config {
    mcpServerPath?: string;
    defaultModel?: string;
    defaultTopK?: number;
    defaultMaxContext?: number;
}
//# sourceMappingURL=index.d.ts.map