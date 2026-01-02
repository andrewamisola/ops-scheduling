#!/usr/bin/env node
// Pre-Compact Hook: Auto-save session state before context compaction
// Cross-platform (Mac + Windows)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SESSION_LOG = path.join(PROJECT_DIR, '.claude', 'SESSION_LOG.md');

const now = new Date();
const timestamp = now.toLocaleString('en-US', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});

// Log that compaction is happening
if (fs.existsSync(SESSION_LOG)) {
  fs.appendFileSync(SESSION_LOG, `\n- **${timestamp}** | **COMPACT** | Context compaction triggered\n`);
}

// Run the session save script
try {
  const saveScript = path.join(PROJECT_DIR, '.claude', 'hooks', 'session-save.js');
  if (fs.existsSync(saveScript)) {
    execSync(`node "${saveScript}"`, { stdio: 'pipe' });
  }
} catch (e) {
  // Silently continue
}

const divider = '━'.repeat(60);
console.log('');
console.log(divider);
console.log('CONTEXT COMPACTION TRIGGERED');
console.log(divider);
console.log('');
console.log('Auto-saved session state to .claude/HANDOFF.md');
console.log('');
console.log('IMPORTANT: Before compaction completes, fill in:');
console.log('  - What Was Being Worked On');
console.log('  - Current State');
console.log('  - Key Decisions Made');
console.log('');
console.log('Edit: .claude/HANDOFF.md');
console.log(divider);

process.exit(0);
