# Envault

> Encrypted Git-Ops for your Environment Variables.

Envault is a CLI tool that encrypts `.env` files using AES-256-GCM so they can be safely committed to Git. It validates `.env` formatting and provides an MCP server for AI agent integration.

## Quick Reference

```bash
# Build
npm run build

# Development (run without building)
npm run dev -- <command>

# Test
npm test

# Run CLI locally
node dist/bin/envault.js <command>
```

## Architecture

```
src/
├── bin/envault.ts       # CLI entry point (Commander.js)
├── commands/            # CLI commands
│   ├── audit.ts         # Scan directories for .env health
│   ├── check.ts         # Validate .env formatting
│   ├── file.ts          # Encrypt/decrypt arbitrary files
│   ├── init.ts          # Generate new ENVAULT_KEY
│   ├── mcp.ts           # Start MCP server
│   ├── pull.ts          # Decrypt config.enc → .env
│   └── push.ts          # Encrypt .env → config.enc
├── lib/
│   └── env-manager.ts   # Core encryption/validation logic
└── mcp/
    └── server.ts        # MCP server (EnvaultMcpServer class)
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `envault init` | Generate a new 256-bit ENVAULT_KEY |
| `envault check [--fix]` | Validate .env formatting (--fix auto-repairs) |
| `envault push [--force]` | Encrypt .env → config.enc |
| `envault pull [--force]` | Decrypt config.enc → .env |
| `envault audit -d <dir> [--fix]` | Scan directory tree for .env health |
| `envault file push <file>` | Encrypt arbitrary file |
| `envault file pull <file> [output]` | Decrypt arbitrary file |
| `envault mcp` | Start MCP server (stdio transport) |

## Key Concepts

- **ENVAULT_KEY**: 256-bit (64 hex chars) encryption key. Required as env var for push/pull.
- **config.enc**: Encrypted output file. Safe to commit.
- **AES-256-GCM**: Authenticated encryption. Ensures integrity and confidentiality.

## MCP Server

The MCP server (`envault mcp`) exposes these tools to AI agents:

| Tool | Description |
|------|-------------|
| `audit_directory` | Scan repo and report MISSING/UNTRACKED/SYNCED status |
| `encrypt_file` | Encrypt a file with provided key |
| `decrypt_file` | Decrypt a file with provided key |
| `generate_key` | Create a new ENVAULT_KEY |

**MCP Config:**
```json
{
  "mcpServers": {
    "envault": {
      "command": "envault",
      "args": ["mcp"]
    }
  }
}
```

## Dependencies

- **@modelcontextprotocol/sdk**: MCP server implementation
- **commander**: CLI framework
- **chalk**: Terminal styling
- **dotenv**: .env parsing
- **zod**: Schema validation

## Common Tasks

### Adding a New CLI Command

1. Create `src/commands/mycommand.ts`
2. Export a function that registers with Commander
3. Import and register in `src/bin/envault.ts`

### Adding a New MCP Tool

1. Edit `src/mcp/server.ts`
2. Add tool in `setupTools()` using `this.server.tool(name, schema, handler)`
3. Schema uses Zod for validation

### Testing Encryption Locally

```bash
# Generate key
export ENVAULT_KEY=$(node dist/bin/envault.js init 2>&1 | grep -oE '[a-f0-9]{64}')

# Create test .env
echo "TEST=value" > .env

# Encrypt then decrypt
node dist/bin/envault.js push
node dist/bin/envault.js pull --force
```

## Part of the Treebird Ecosystem

This tool integrates with other Treebird projects via MCP, enabling AI agents to manage secrets securely.
