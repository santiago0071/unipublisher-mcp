# UniPublisher MCP Bridge

[![Model Context Protocol](https://img.shields.io/badge/MCP-Standard-blue)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-informational)](https://unipublisher.app)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) bridge connecting AI agents (Claude Desktop, Cursor, and custom autonomous agents) to the [UniPublisher](https://unipublisher.app) desktop workstation.

---

## What is UniPublisher?

**UniPublisher** is a local-first desktop workstation for content creators, Web3 project teams, and market analysts. It provides Markdown-based drafting, market signal intelligence (macro indicators and RWA research), and concurrent publishing across 17+ platforms (Binance Square, Telegram, Substack, X, WordPress, LinkedIn, WeChat, Zhihu, and more).

This repository provides the open-source **stdio MCP server adapter** allowing external AI models to safely interact with your local UniPublisher workstation without credential exposure.

---

## Key Features

- **Local Hardware Credential Isolation**: AI models and external agents never ingest or prompt for account passwords, cookies, or API keys. All credentials remain encrypted inside your host operating system vault (Windows safeStorage DPAPI / macOS Keychain).
- **Human-in-the-Loop Safeguard**: Rogue execution prevention. When an agent invokes the publishing tool, UniPublisher raises an interactive desktop modal showing rendered previews, target channels, and destination accounts. Publishing only occurs upon active human confirmation.
- **Unified Syndication**: Direct publishing and draft saving across 17+ international, financial, and Web3 destinations.

---

## Prerequisites

1. **UniPublisher Desktop Client**: Installed and running on your machine ([Download Windows / macOS](https://unipublisher.app)).
2. **Node.js**: v18.0 or newer.

---

## Quick Start: Claude Desktop

Add the server to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "unipublisher": {
      "command": "npx",
      "args": ["-y", "unipublisher-mcp"]
    }
  }
}
```

Restart Claude Desktop. The UniPublisher tools will automatically appear in Claude's tool picker.

---

## Exposed MCP Tools

### 1. `list_supported_channels`
Lists all available publishing destinations and their authentication states in the local UniPublisher client.
- **Parameters**: None
- **Returns**: Array of platform identifiers, names, and connection statuses.

### 2. `publish_article`
Stages an article for dispatch to selected platforms.
- **Parameters**:
  - `title` (string, required): Title of the post or article.
  - `content` (string, required): Body formatted in Markdown.
  - `channels` (array of strings, required): Target platform IDs (e.g. `["binance", "telegram", "substack", "x"]`).
  - `mode` (string, optional): `"draft"` (default) to save into platform draft boxes, or `"publish"` for direct posting.
- **Behavior**: Raises an interactive approval dialog in the UniPublisher desktop application.

### 3. `get_publish_status`
Checks delivery receipts and confirmation logs for a dispatched job.
- **Parameters**:
  - `jobId` (string, required): Job identifier.

---

## Architecture

```
┌─────────────────────────────────┐
│ AI Host (Claude Desktop / Cursor)│
└───────────────┬─────────────────┘
                │ stdio (JSON-RPC 2.0)
┌───────────────▼─────────────────┐
│       unipublisher-mcp          │ (Open-Source Adapter)
└───────────────┬─────────────────┘
                │ Local IPC / Loopback
┌───────────────▼─────────────────┐
│ UniPublisher Desktop Client     │ (Local-First Workstation)
│ ├─ Interactive Approval Modal   │
│ ├─ Local Credential Vault       │
│ └─ Outbound Dispatch Engine     │
└─────────────────────────────────┘
```

---

## License

[MIT](LICENSE) © UniPublisher.
