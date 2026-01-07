# 🔐 Envault

**Encrypted Git-Ops for your Environment Variables.**

Envault is a simple, secure CLI tool to manage your `.env` files. It encrypts your secrets so you can commit them to Git, and validates your `.env` formatting to prevent production outages.

## 🚀 Quick Start

```bash
# 1. Install (Global)
npm install -g envault

# 2. Initialize in your repo
envault init
# -> Generates a new ENVAULT_KEY. Save this!

# 3. Validate your .env
envault check
# -> Detects missing newlines, spacing issues, etc.

# 4. Encrypt & Commit
envault push
# -> Encrypts .env -> config.enc (Safe to commit)
git add config.enc
```

## 📦 Usage

### `envault check [--fix]`
Validates `.env` formatting.
-   **Checks**: Missing newlines at EOF, spaces around `=`, valid syntax.
-   **`--fix`**: Automatically repairs issues (creates `.env.bak` first).

### `envault push`
Encrypts `.env` to `config.enc`.
-   Requires `ENVAULT_KEY` environment variable.
-   Validates before encrypting (unless `--force`).

### `envault pull`
Decrypts `config.enc` to `.env`.
-   Requires `ENVAULT_KEY` environment variable.
-   Won't overwrite existing `.env` without `--force`.

### `envault audit`
Scans an entire directory tree for `.env` health.
-   `envault audit -d .` : Checks all subdirectories.
-   `envault audit -d . --fix` : Auto-fixes all found issues (with backups).

### `envault file`
Encrypt or decrypt arbitrary files (e.g., certificates, keys).
-   `envault file push key.pem` : Encrypts `key.pem` -> `key.pem.enc`.
-   `envault file pull key.pem.enc` : Decrypts `key.pem.enc` -> `key.pem`.
-   `envault file pull key.pem.enc out.key` : Decrypts to custom output `out.key`.

### `envault init`
Generates a cryptographically strong 256-bit key for use as `ENVAULT_KEY`.

## 🤖 AI Agents (MCP)

Envault includes a native [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server. This allows AI agents (like Claude Desktop, Cursor, etc.) to natively audit, check, and manage your secrets.

**Add to your MCP config:**

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

**Capabilities:**
- `audit_directory`: Scan repo health and report MISSING/UNTRACKED files.
- `encrypt_file` / `decrypt_file`: Manage arbitrary secrets.
- `generate_key`: Create new keys.

## 🔒 Security

-   **Algorithm**: AES-256-GCM (Authenticated Encryption).
-   **Key**: 256-bit (64 hex characters) random key.
-   **Integrity**: GCM ensures the encrypted file hasn't been tampered with.

## 🛠 Project Structure

Envault is designed to be drop-in compatible with any Node.js, Python, or Ruby project that uses `.env` files.

---

*Part of the Treebird Ecosystem.*
