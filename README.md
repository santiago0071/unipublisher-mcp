# UniPublisher MCP

Let AI agents such as Claude Desktop and Cursor ask **[UniPublisher](https://unipublisher.app/en/)** to save drafts or publish articles to your channels — with you approving every request in the desktop app.

> **The MCP server is built into the UniPublisher desktop app.**
> This repository is documentation only. There is no npm package to install, and you should not run `npx unipublisher-mcp`: that name is not published by UniPublisher.

---

## How it works

```
MCP client (Claude Desktop, Cursor, …)
        │  stdio
        ▼
MCP adapter shipped inside UniPublisher
        │  authenticated local connection (no network port)
        ▼
UniPublisher desktop app  ──►  you review and approve  ──►  your logged-in channels
```

- The adapter runs from the UniPublisher installation itself. It needs no system Node.js and downloads nothing.
- Nothing listens on the network. The adapter only talks to the UniPublisher app on the same computer, and only after both sides authenticate.
- Publishing reuses the same code path as clicking **Publish** in the app. There is no separate, less-tested "MCP version" of a channel.

## Requirements

- UniPublisher desktop **1.6.8 or later**, **running**. The adapter cannot start the app for you.
  - [Windows (.exe)](https://dl.unipublisher.app/download/latest)
  - [Microsoft Store](https://apps.microsoft.com/detail/9njvc7lb0jwp?hl=en-US)
  - [macOS (.dmg, Apple Silicon)](https://dl.unipublisher.app/download/mac)
- An MCP client that supports stdio servers.
- You are logged in to the channels you want to use, inside UniPublisher.

## Setup

1. In UniPublisher, open **AI Assistant → External AI Agent Interface (MCP)…**
2. Tick the channels an AI agent may use. **New channels are unauthorized by default**; an agent cannot see or target a channel you have not ticked.
3. Turn the interface on.
4. Click **Copy MCP Configuration** and merge the `mcpServers.unipublisher` entry into your client's config file. Don't overwrite other servers you already have.
   - Claude Desktop: `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
   - Cursor: `~/.cursor/mcp.json`
5. Restart the client.

The copied entry has this shape. **Always copy it from the app**: the values are generated for your installation and won't work if typed by hand.

```json
{
  "mcpServers": {
    "unipublisher": {
      "command": "<copied from UniPublisher>",
      "args": ["<copied from UniPublisher>"],
      "env": { "<copied from UniPublisher>": "<copied from UniPublisher>" }
    }
  }
}
```

If you move the app, reinstall it, or the Microsoft Store updates it to a new folder, copy the configuration again.

## Tools

| Tool | Input | What it returns |
|---|---|---|
| `list_supported_channels` | — | Only the channels you authorized, with their capabilities and cached login state. Never cookies or keys. |
| `save_draft` | `requestId`, `title`, `content`, `channels` | A job receipt waiting for your approval. **Not** a saved draft yet. |
| `publish_article` | `requestId`, `title`, `content`, `channels` | A job receipt waiting for your approval. **Not** a published article yet. |
| `get_publish_status` | `jobId` | The job state and a result for each channel. |
| `cancel_publish_job` | `jobId` | The job after cancelling channels that have not started. |

Every tool has input and output JSON Schemas and returns `structuredContent`.

### Every write needs your approval

`save_draft` and `publish_article` open a review window in UniPublisher. It shows the full text, the target channels and accounts, and what will happen. Nothing is sent until you approve. If you close the window or let it time out, nothing is sent. Pending requests expire after five minutes.

### Read the status honestly

Job states: `awaiting_confirmation`, `queued`, `running`, `completed`, `cancelled`, `expired`, `unknown`.
Per-channel results: `draft_saved`, `submitted`, `failed`, `unknown`, `cancelled`.

- `completed` means the job **finished**, not that every channel succeeded. Check each channel.
- `submitted` does **not** guarantee the article is public. Some platforms review submissions first, and WeChat needs an administrator QR-code scan.
- `unknown` means UniPublisher could not confirm the result. **Do not retry automatically**: the article may already be live. Check the platform by hand.
- Published URLs come only from what the platform actually returned. They are never guessed.

### Retries and `requestId`

Generate one `requestId` (8–100 characters: letters, digits, `-`, `_`) per intended action and **reuse it when retrying**. The same `requestId` with the same content returns the original receipt. The same `requestId` with different content is rejected with `IDEMPOTENCY_CONFLICT`. Never switch to a new `requestId` to get around an `unknown` result.

## Limits

- **Text Markdown only, long-form articles only.** Supported: headings, paragraphs, bold, italic, links, plain lists, simple quotes, code blocks and tables. Inline code is kept as plain text.
- **Rejected, not silently dropped:** images, raw HTML, strikethrough, task lists and complex nesting. You get an error such as `UNSUPPORTED_MEDIA_OR_HTML` or `UNSUPPORTED_MARKDOWN` instead of a post with missing parts.
- **Not supported:** short posts, attachments, local file paths, fetching URLs, scheduling, and declarations such as "original content".
- **Per request:** up to 12 channels, a 240-character title and 100,000 characters of content. Up to 5 jobs can wait for approval at once.
- **Drafts:** `save_draft` only accepts channels that have platform drafts. Binance Square and Telegram, for example, are rejected, never quietly published instead.
- **LinkedIn** is not available to agents: its terms do not allow automation.
- **Cancelling** stops channels that have not started. It cannot take back an article that is already public, and a channel already in progress may finish.

## Channels

UniPublisher connects to 17 channels: WeChat Official Accounts, Xueqiu, Zhihu, Weibo, Eastmoney, Tiger Brokers, CSDN, Binance Square, Odaily, PANews, Jinse, Foresight News, X, Substack, Telegram, WordPress and LinkedIn.

What an agent can actually use is whatever `list_supported_channels` returns: the channels you authorized, minus those that cannot be automated.

## Security and privacy

- Passwords, cookies, API keys, page content and screenshots are never returned to the AI model.
- Article text is stored locally only while a job waits or runs, and is deleted when it ends. UniPublisher keeps only the receipt needed to prevent duplicates. AI conversations are not stored.
- Approvals are accepted only from UniPublisher's own main window. What a client says about itself is not treated as proof of identity.
- **Scope:** this protects the channel from web pages and from other users on the same computer. It is not a sandbox against malware already running as your user account. Your MCP client's own file and terminal permissions are outside UniPublisher's control.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| The client can't start `unipublisher` | UniPublisher isn't running, the interface is off, or the app moved. Copy the configuration again. |
| `list_supported_channels` is empty | No channels are authorized in the MCP panel. |
| A request never appears in the app | Check that the interface is on and the app window is open. |
| `UNSUPPORTED_MEDIA_OR_HTML` | Remove images and HTML from the Markdown. Add images in the UniPublisher editor instead. |

## Links

- Website: https://unipublisher.app/en/
- Announcement: https://unipublisher.app/en/blog/mcp-server-official-release
- Support: contact@unipublisher.app

## License

The documentation in this repository is MIT licensed. The UniPublisher desktop app is not covered by this license.
