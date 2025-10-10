#!/usr/bin/env node

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3010';
let ws = null;
let messageQueue = [];

function connect() {
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.error('[MCP Client] Connected to Obsidian MCP Server on port 3010');

    // Send any queued messages
    while (messageQueue.length > 0 && ws.readyState === WebSocket.OPEN) {
      const msg = messageQueue.shift();
      console.error('[MCP Client] Sending queued message:', msg);
      ws.send(msg);
    }
  });

  ws.on('message', (data) => {
    try {
      const response = data.toString();
      console.error('[MCP Client] Received from server:', response);
      // Forward to stdout (with newline for Claude Desktop)
      process.stdout.write(response + '\n');
    } catch (error) {
      console.error('[MCP Client] Error processing message:', error.message);
    }
  });

  ws.on('error', (error) => {
    console.error('[MCP Client] WebSocket error:', error.message);
    process.exit(1);
  });

  ws.on('close', () => {
    console.error('[MCP Client] WebSocket connection closed');
    process.exit(1);
  });
}

// Read from stdin (MCP protocol uses newline-delimited JSON)
let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();

  // Process complete lines
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      // Validate JSON
      JSON.parse(trimmed);
      console.error('[MCP Client] Received from stdin:', trimmed);

      if (ws && ws.readyState === WebSocket.OPEN) {
        console.error('[MCP Client] Forwarding to WebSocket');
        ws.send(trimmed);
      } else {
        console.error('[MCP Client] WebSocket not ready, queuing message');
        messageQueue.push(trimmed);
      }
    } catch (error) {
      console.error('[MCP Client] Invalid JSON from stdin:', error.message);
    }
  }
});

process.stdin.on('end', () => {
  console.error('[MCP Client] stdin closed');
  if (ws) ws.close();
  process.exit(0);
});

// Handle termination
process.on('SIGINT', () => {
  if (ws) ws.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (ws) ws.close();
  process.exit(0);
});

// Start connection
connect();
