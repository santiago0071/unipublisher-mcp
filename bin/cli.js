#!/usr/bin/env node

// The UniPublisher MCP server ships inside the UniPublisher desktop app and
// connects to it over an authenticated local channel. This script is not that
// server: it only points people to the real setup, and exits with an error so
// that no MCP client ever mistakes it for a working connection.

process.stderr.write(`UniPublisher MCP is built into the UniPublisher desktop app.

1. Install and open UniPublisher 1.6.8 or later: https://unipublisher.app
2. Open AI Assistant -> External AI Agent Interface (MCP)...
3. Authorize channels, turn the interface on, then click "Copy MCP Configuration"
   and paste it into your MCP client's config.

Docs: https://github.com/santiago0071/unipublisher-mcp
`);
process.exit(1);
