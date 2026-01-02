#!/usr/bin/env node
// Post-hook: Comprehensive edit logging
// Cross-platform (Mac + Windows)

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SESSION_LOG = path.join(PROJECT_DIR, '.claude', 'SESSION_LOG.md');

// Read input from stdin (Claude passes JSON)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path;
    const toolName = data?.tool_name || 'Edit';
    const oldString = (data?.tool_input?.old_string || '').slice(0, 100);

    if (!filePath) process.exit(0);

    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const dateHeader = now.toISOString().slice(0, 10);

    // Create session log if doesn't exist
    if (!fs.existsSync(SESSION_LOG)) {
      fs.writeFileSync(SESSION_LOG, `# Session Log

Auto-generated log of all changes made by Claude.

---

`);
    }

    let logContent = fs.readFileSync(SESSION_LOG, 'utf8');

    // Add date header if new day
    if (!logContent.includes(`## ${dateHeader}`)) {
      logContent += `\n## ${dateHeader}\n\n`;
    }

    // Determine change description
    let changeDesc;
    if (toolName === 'Write') {
      changeDesc = 'Created new file';
    } else if (oldString) {
      const preview = oldString.replace(/\n/g, ' ').slice(0, 50);
      changeDesc = `Changed: \`${preview}...\``;
    } else {
      changeDesc = 'Modified file';
    }

    // Get relative path for cleaner logs
    const relPath = filePath.replace(PROJECT_DIR + path.sep, '');

    // Log the edit
    logContent += `- **${timestamp}** | \`${relPath}\` | ${changeDesc}\n`;
    fs.writeFileSync(SESSION_LOG, logContent);

    console.log(`Logged: ${relPath}`);
  } catch (e) {
    // Silently exit on parse errors
  }
  process.exit(0);
});
