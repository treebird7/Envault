# Changelog

All notable changes to Envault will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-08

### Added
- **Global Scan Command**: `envault scan <cmd>` - Run commands across all subdirectories with automatic key propagation
- **Keys Management**: `envault keys --generate` - Generate Ed25519 keypairs compatible with Mycmail
- **MCP Server**: Native Model Context Protocol server for AI agent integration
  - `audit_directory` - Scan repository health
  - `encrypt_file` / `decrypt_file` - Manage encrypted files
  - `generate_key` - Create new encryption keys
- **Community Health Files**:
  - CONTRIBUTING.md - Contribution guidelines
  - CODE_OF_CONDUCT.md - Contributor Covenant
  - SECURITY.md - Vulnerability reporting policy
  - GitHub issue and PR templates
- **Enhanced Documentation**:
  - npm badges for version, downloads, and license
  - Multi-repo management guide
  - Mycmail integration documentation
  - Treebird ecosystem branding

### Changed
- Enhanced package.json for npm discoverability with expanded keywords
- Added repository, homepage, and bugs URLs
- Improved README with comprehensive feature documentation

### Fixed
- TypeScript error with environment variable propagation in scan command
- Zod dependency downgraded to v3 to resolve MCP hang issues
- Removed unused imports and added debug logging in MCP server

### Security
- AES-256-GCM authenticated encryption
- Path traversal protection with `validatePathWithinCwd()`
- Input validation using Zod schemas on all MCP tools
- Zero npm audit vulnerabilities

## [Unreleased]

### Planned
- Additional MCP tools for advanced secret management
- Integration with more agent frameworks
- Enhanced multi-environment support

---

*Part of the [Treebird Ecosystem](https://treebird.uk) 🌳*
