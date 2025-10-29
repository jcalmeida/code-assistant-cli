import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import { SearchResult, ChatResponse, RepositoryStats, SearchOptions, ChatOptions } from '../types/index.js';

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;
  private serverProcess: ChildProcess | null = null;
  private isConnected = false;

  constructor() {
    this.client = new Client(
      {
        name: 'code-assistant-cli',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(serverPath: string = '../code-rag'): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Spawn the MCP server process
      this.serverProcess = spawn('python', ['-m', 'src.mcp_server'], {
        cwd: serverPath,
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      if (!this.serverProcess.stdout || !this.serverProcess.stdin) {
        throw new Error('Failed to create server process pipes');
      }

      // Create transport
      this.transport = new StdioClientTransport({
        readable: this.serverProcess.stdout,
        writable: this.serverProcess.stdin,
      } as any);

      // Connect client
      await this.client.connect(this.transport);
      this.isConnected = true;

      console.log('✅ Connected to Code RAG MCP server');
    } catch (error) {
      console.error('❌ Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    this.isConnected = false;
  }

  async searchCode(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'search_code',
        arguments: {
          query: options.query,
          repo_names: options.repoNames,
          languages: options.languages,
          top_k: options.topK || 5,
        },
      });

      // Parse the MCP response
      if (result.content && Array.isArray(result.content) && result.content[0]?.type === 'text') {
        const text = (result.content[0] as any).text;
        return this.parseSearchResults(text);
      }

      return [];
    } catch (error) {
      console.error('Error searching code:', error);
      throw error;
    }
  }

  async chatWithCode(options: ChatOptions): Promise<ChatResponse> {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'chat_with_code',
        arguments: {
          message: options.message,
          repo_names: options.repoNames,
          languages: options.languages,
          max_context_chunks: options.maxContextChunks || 5,
          model: options.model || 'claude-sonnet-4-5',
        },
      });

      if (result.content && Array.isArray(result.content) && result.content[0]?.type === 'text') {
        const text = (result.content[0] as any).text;
        return this.parseChatResponse(text);
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error chatting with code:', error);
      throw error;
    }
  }

  async getRepositoryStats(): Promise<RepositoryStats> {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'get_repository_stats',
        arguments: {},
      });

      if (result.content && Array.isArray(result.content) && result.content[0]?.type === 'text') {
        const text = (result.content[0] as any).text;
        return this.parseStatsResponse(text);
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error getting repository stats:', error);
      throw error;
    }
  }

  async ingestRepository(repoName: string, force = false): Promise<string> {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'ingest_repository',
        arguments: {
          repo_name: repoName,
          force,
        },
      });

      if (result.content && Array.isArray(result.content) && result.content[0]?.type === 'text') {
        return (result.content[0] as any).text;
      }

      return 'Ingestion completed';
    } catch (error) {
      console.error('Error ingesting repository:', error);
      throw error;
    }
  }

  private parseSearchResults(text: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Extract results from formatted text
    const resultBlocks = text.split('## Result ').slice(1);
    
    for (const block of resultBlocks) {
      const lines = block.split('\n');
      const scoreMatch = lines[0].match(/Score: ([\d.]+)/);
      const fileMatch = block.match(/\*\*File\*\*: ([^\n]+)/);
      const repoMatch = block.match(/\*\*Repository\*\*: ([^\n]+)/);
      const languageMatch = block.match(/\*\*Language\*\*: ([^\n]+)/);
      const typeMatch = block.match(/\*\*Type\*\*: ([^\n]+)/);
      const nameMatch = block.match(/\*\*Name\*\*: ([^\n]+)/);
      const codeMatch = block.match(/```[\w]*\n([\s\S]*?)\n```/);

      if (scoreMatch && fileMatch && repoMatch && codeMatch) {
        const filePath = fileMatch[1].split(' (')[0].trim();
        const linesMatch = fileMatch[1].match(/\(lines (\d+)-(\d+)\)/);
        
        results.push({
          chunk: {
            id: `chunk_${results.length}`,
            repo_name: repoMatch[1].trim(),
            file_path: filePath,
            language: languageMatch?.[1]?.trim() || 'unknown',
            content: codeMatch[1].trim(),
            start_line: linesMatch ? parseInt(linesMatch[1]) : 1,
            end_line: linesMatch ? parseInt(linesMatch[2]) : 10,
            chunk_type: typeMatch?.[1]?.trim() || 'code_block',
            metadata: {
              name: nameMatch?.[1]?.trim(),
            },
          },
          score: parseFloat(scoreMatch[1]),
        });
      }
    }

    return results;
  }

  private parseChatResponse(text: string): ChatResponse {
    // Extract the assistant response and sources
    const assistantMatch = text.match(/\*\*Assistant[^:]*\*\*:\n([\s\S]*?)(?:\n\n\*\*Sources\*\*|$)/);
    const sourcesMatch = text.match(/\*\*Sources\*\*[^:]*:\n([\s\S]*?)$/);

    const response = assistantMatch?.[1]?.trim() || text;
    const sources: SearchResult[] = [];

    if (sourcesMatch) {
      const sourceLines = sourcesMatch[1].split('\n').filter(line => line.trim());
      for (const line of sourceLines) {
        const match = line.match(/\d+\.\s+([^(]+)\s+\(lines\s+(\d+)-(\d+)\)\s+-\s+Score:\s+([\d.]+)/);
        if (match) {
          sources.push({
            chunk: {
              id: `source_${sources.length}`,
              repo_name: 'unknown',
              file_path: match[1].trim(),
              language: 'unknown',
              content: '',
              start_line: parseInt(match[2]),
              end_line: parseInt(match[3]),
              chunk_type: 'reference',
              metadata: {},
            },
            score: parseFloat(match[4]),
          });
        }
      }
    }

    return {
      response,
      sources,
      model_used: 'claude-sonnet-4-5',
    };
  }

  private parseStatsResponse(text: string): RepositoryStats {
    const totalChunksMatch = text.match(/Total chunks:\s*(\d+)/);
    const totalFilesMatch = text.match(/Total files:\s*(\d+)/);
    const totalReposMatch = text.match(/Total repositories:\s*(\d+)/);
    const languagesMatch = text.match(/Languages:\s*([^\n]+)/);
    const lastUpdatedMatch = text.match(/Last updated:\s*([^\n]+)/);

    return {
      total_chunks: totalChunksMatch ? parseInt(totalChunksMatch[1]) : 0,
      total_files: totalFilesMatch ? parseInt(totalFilesMatch[1]) : 0,
      total_repositories: totalReposMatch ? parseInt(totalReposMatch[1]) : 0,
      languages: languagesMatch ? languagesMatch[1].split(',').map(l => l.trim()) : [],
      last_updated: lastUpdatedMatch?.[1]?.trim() || 'Unknown',
    };
  }
}
