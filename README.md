# UniPublisher MCP Server

[![Model Context Protocol](https://img.shields.io/badge/MCP-Standard-blue)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-informational)](https://unipublisher.app)
[![Microsoft Store](https://img.shields.io/badge/Microsoft_Store-Verified_App-0078D4?logo=microsoft)](https://apps.microsoft.com/detail/9njvc7lb0jwp)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server and desktop bridge for **[UniPublisher](https://unipublisher.app)** — the local-first desktop publishing workstation for content creators, researchers, and Web3 teams.

Connect AI agents (**Claude Desktop**, **Cursor**, **Windsurf**, or custom LLM pipelines) directly to your local desktop environment to compose, stage, format, and concurrently syndicate long-form articles and short posts across **17+ platforms** with zero credential exposure.

---

## Why UniPublisher + MCP?

### The Multi-Channel Publishing Problem
Modern creators, research analysts, and tech founders face significant friction when distributing content:
- **Repetitive Formatting**: A single article must be manually adapted, reformatted, and copy-pasted across Substack, Telegram, Binance Square, X, WordPress, WeChat, and LinkedIn — consuming 1 to 2 hours per publication.
- **Formatting Inconsistencies**: Markdown syntax (code snippets, callout boxes, headers, tables, and image references) routinely breaks when pasted into various proprietary web rich-text editors.
- **Cloud Credential Risk**: Most third-party SaaS management tools require users to upload sensitive platform account credentials, session cookies, or API keys to remote cloud servers.

### The Local-First Solution
**UniPublisher** solves this by keeping all credentials, drafts, and media strictly on your local machine:
- **Local-First Security**: Session tokens and API keys are encrypted locally using OS-native security primitives (Windows DPAPI and macOS Keychain). Drafts and secrets never touch any third-party cloud.
- **Human-in-the-Loop Confirmation Gate**: External AI agents cannot silently publish to your live accounts. When an agent invokes the MCP tool, UniPublisher brings up an interactive desktop review modal showing formatted previews and target channels. Publishing occurs only upon direct human confirmation.
- **Platform-Aware AST Engine**: Formats Markdown cleanly into native platform representations tailored for each destination.

---

## Supported Publishing Destinations

UniPublisher natively dispatches and manages drafts across 17+ major content platforms:

| Platform Category | Supported Destinations | Supported Content Formats |
| :--- | :--- | :--- |
| **Web3 & Crypto** | **Binance Square** (币安广场), **Telegram** (Channel & Telegraph instant view), **X / Twitter** | Short posts, threads, market alerts, full research articles |
| **Newsletters & Blogs** | **Substack**, **WordPress** (Self-hosted & WP.com), **Medium**, **Ghost** | Long-form articles, essays, technical tutorials, custom drafts |
| **Professional & Social** | **LinkedIn**, **Facebook Pages**, **Reddit** | Professional updates, long-form posts, community discussions |
| **Tech & Creator Networks** | **WeChat Official Account** (微信公众号), **Zhihu** (知乎), **Xueqiu** (雪球), **Eastmoney** (东方财富), **Toutiao**, **Bilibili** | Tech deep-dives, financial commentaries, columns, rich-text drafts |

---

## How It Works

```
+-------------------------------------------------------------+
|               AI Agent Host (Claude / Cursor)               |
+-------------------------------------------------------------+
                              |
                              | Standard MCP Protocol (stdio JSON-RPC 2.0)
                              v
+-------------------------------------------------------------+
|               unipublisher-mcp (Open-Source)                |
|               Local Stdio Bridge & Adapter                  |
+-------------------------------------------------------------+
                              |
                              | Local Loopback IPC
                              v
+-------------------------------------------------------------+
|              UniPublisher Desktop Application               |
|                                                             |
|   [1] Interactive Preview & Human Confirmation Gate         |
|   [2] Local OS Credential Vault (Windows DPAPI / Keychain)  |
|   [3] Platform-Aware AST Formatting Engine                  |
|   [4] Concurrent Outbound Publishing Engine                 |
+-------------------------------------------------------------+
                              |
                              | Direct Encrypted HTTPS Requests
                              v
+-------------------------------------------------------------+
|       17+ Platforms (Binance Square, Substack, X, etc.)     |
+-------------------------------------------------------------+
```

---

## Installation & Setup

### Prerequisites
1. **UniPublisher Desktop Application**: Installed and launched on your machine.
   - [Download for Windows (.exe installer)](https://dl.unipublisher.app/download/latest)
   - [Get it on the Microsoft Store](https://apps.microsoft.com/detail/9njvc7lb0jwp) (Verified ID: `9NJVC7LB0JWP`)
   - [Download for macOS (.dmg Apple Silicon)](https://dl.unipublisher.app/download/mac)
2. **Node.js**: v18.0 or higher.

---

### Setup for Claude Desktop

Add `unipublisher-mcp` to your Claude Desktop configuration file:

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

Restart Claude Desktop. You will see `unipublisher` in the installed tools menu.

---

### Setup for Cursor / Windsurf

Add `unipublisher-mcp` as an MCP server in your workspace configuration:

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

---

## Available MCP Tools

### 1. `list_supported_channels`
Returns all supported distribution channels and their current connection states in your local UniPublisher client.
- **Parameters**: None
- **Sample Output**:
  ```json
  [
    { "id": "binance", "name": "Binance Square", "connected": true, "type": "crypto" },
    { "id": "substack", "name": "Substack", "connected": true, "type": "newsletter" },
    { "id": "telegram", "name": "Telegram", "connected": true, "type": "messaging" },
    { "id": "x", "name": "X (Twitter)", "connected": true, "type": "social" },
    { "id": "wechat", "name": "WeChat Official Account", "connected": true, "type": "longform" }
  ]
  ```

### 2. `publish_article`
Stages an article or post for dispatch to designated channels.
- **Parameters**:
  - `title` *(string, required)*: Headline or title of the post.
  - `content` *(string, required)*: Main body formatted in Markdown.
  - `channels` *(array of strings, required)*: Target platform IDs (e.g. `["binance", "telegram", "substack", "x"]`).
  - `mode` *(string, optional)*: `"draft"` (default) to save directly into channel draft boxes, or `"publish"` for live posting.
- **Safety Mechanism**: Raises an interactive approval modal on your desktop displaying the rendered layout, destination accounts, and target channels. Execution proceeds only when you click "Confirm & Publish".

### 3. `get_publish_status`
Queries delivery receipts and execution status for a queued or completed publication job.
- **Parameters**:
  - `jobId` *(string, required)*: Job identifier returned by `publish_article`.

---

## Real-World Use Cases

### 1. AI-Assisted Market Research & Synthesis
Ask Claude or Cursor to analyze recent financial/crypto datasets, synthesize key takeaways into structured Markdown, and immediately stage the commentary for concurrent publishing across Binance Square, Telegram channels, and Substack.

### 2. Cross-Posting Developer & Tech Blogs
Write technical tutorials in Markdown within your IDE. Trigger the UniPublisher MCP tool to publish simultaneously to your WordPress blog, Substack newsletter, and WeChat Official Account with syntax-highlighted code blocks preserved.

### 3. Autonomous Marketing Pipelines with Human Oversight
Deploy autonomous agents to generate scheduled content summaries. UniPublisher acts as the secure execution gateway, holding every post in a human-review state until approved on your desktop screen.

---

## Security & Privacy Guarantee

- **No Remote Credential Ingestion**: This MCP bridge runs strictly on `localhost` via standard I/O (stdio). It never sends authentication tokens to external servers.
- **No Third-Party Analytics**: Neither UniPublisher nor this adapter injects tracking pixels or data collection scripts into your published content.
- **Open-Source Stdio Adapter**: All code in this repository is open-source under the MIT license and can be audited line-by-line.

---

## Official Links & Resources

- **Official Website**: [https://unipublisher.app](https://unipublisher.app)
- **Windows Download**: [Download .exe Installer](https://dl.unipublisher.app/download/latest)
- **Microsoft Store**: [Install via Microsoft Store](https://apps.microsoft.com/detail/9njvc7lb0jwp)
- **macOS Download**: [Download .dmg (Apple Silicon)](https://dl.unipublisher.app/download/mac)
- **Standard PAD File**: [pad.xml](https://unipublisher.app/pad.xml)
- **Issues & Feedback**: [GitHub Issues](https://github.com/santiago0071/unipublisher-mcp/issues)

---

## License

[MIT](LICENSE) © UniPublisher.
