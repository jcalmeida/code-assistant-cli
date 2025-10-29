# Code Assistant CLI

🚀 **A TypeScript CLI tool that connects to the Code RAG system via MCP (Model Context Protocol) to provide intelligent code exploration and assistance.**

## ✨ Features

- 🔍 **Semantic Code Search**: Find relevant code using natural language queries
- 💬 **Interactive Chat**: Ask questions about your codebase with AI assistance  
- 📊 **Repository Stats**: View indexing statistics and repository information
- 🔄 **Repository Management**: Trigger ingestion and updates
- 🎨 **Beautiful Output**: Formatted, colorized terminal output
- ⚡ **MCP Protocol**: Direct connection to Code RAG server for low latency

## 🛠 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the CLI
node dist/index.js --help
```

## 🚀 Quick Start

**Prerequisites**: Make sure your Code RAG MCP server is running:
```bash
cd ../windsurf-project
python -m src.mcp_server
```

Then use the CLI:

### 🔍 Search Code
```bash
# Basic search
node dist/index.js search "authentication middleware"

# Search with filters
node dist/index.js search "database connection" --repos backend-service --languages python

# Limit results
node dist/index.js search "error handling" --top-k 3
```

### 💬 Chat with AI
```bash
# Single question
node dist/index.js chat "How does user authentication work?"

# Interactive chat mode
node dist/index.js chat --interactive

# Chat with specific context
node dist/index.js chat "Explain the API structure" --context 10
```

### 📊 Repository Statistics
```bash
# View stats
node dist/index.js stats
```

### 🔄 Repository Management
```bash
# Ingest specific repository
node dist/index.js ingest my-backend-repo

# Force full re-indexing
node dist/index.js ingest my-backend-repo --force
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# Path to the Code RAG MCP server
MCP_SERVER_PATH=../windsurf-project

# Default model for chat
DEFAULT_MODEL=claude-sonnet-4-5

# Default number of search results
DEFAULT_TOP_K=5

# Default context chunks for chat
DEFAULT_MAX_CONTEXT=5
```

## Commands

### `search <query>`
Search for code using semantic similarity.

**Options:**
- `-r, --repos <repos...>` - Filter by repository names
- `-l, --languages <languages...>` - Filter by programming languages  
- `-k, --top-k <number>` - Number of results to return (default: 5)
- `-s, --server-path <path>` - Path to MCP server (default: ../windsurf-project)

### `chat [message]`
Chat with AI about your codebase.

**Options:**
- `-r, --repos <repos...>` - Filter by repository names
- `-l, --languages <languages...>` - Filter by programming languages
- `-c, --context <number>` - Maximum context chunks (default: 5)
- `-m, --model <model>` - Model to use (default: claude-sonnet-4-5)
- `-i, --interactive` - Start interactive chat mode
- `-s, --server-path <path>` - Path to MCP server

### `stats`
Show repository statistics.

**Options:**
- `-s, --server-path <path>` - Path to MCP server

### `ingest [repo-name]`
Trigger repository ingestion.

**Options:**
- `-f, --force` - Force full re-indexing
- `-s, --server-path <path>` - Path to MCP server

## Examples

### Search Examples
```bash
# Find authentication code
code-assistant search "user login authentication"

# Find database queries in specific repo
code-assistant search "SELECT FROM users" --repos user-service

# Find Python error handling
code-assistant search "try catch exception" --languages python
```

### Chat Examples
```bash
# Ask about architecture
code-assistant chat "What is the overall architecture of this project?"

# Get help with debugging
code-assistant chat "How do I debug authentication issues?"

# Interactive exploration
code-assistant chat -i
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Watch mode
npm run watch
```

## Architecture

```
┌─────────────────┐    MCP     ┌─────────────────┐
│  CLI Assistant  │ ◄─────────► │  Code RAG       │
│  (TypeScript)   │  Protocol  │  MCP Server     │
└─────────────────┘            └─────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│  Commands       │            │  Vector Store   │
│  • search       │            │  • ChromaDB     │
│  • chat         │            │  • Embeddings   │
│  • stats        │            │  • Code Chunks  │
│  • ingest       │            └─────────────────┘
└─────────────────┘
```

## Requirements

- Node.js 18+
- TypeScript 5+
- Running Code RAG MCP server
- Access to the Code RAG system

## Troubleshooting

### Connection Issues
```bash
# Check if MCP server is running
cd ../windsurf-project
python -m src.mcp_server

# Verify server path
code-assistant stats --server-path /path/to/windsurf-project
```

### Build Issues
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## License

MIT License - See LICENSE file for details.
