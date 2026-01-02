#!/usr/bin/env node
// Save session state before clearing - creates handoff document for next session
// Cross-platform (Mac + Windows)

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SESSION_LOG = path.join(PROJECT_DIR, '.claude', 'SESSION_LOG.md');
const TASKS_FILE = path.join(PROJECT_DIR, '.claude', 'TASKS.md');
const HANDOFF_DIR = path.join(PROJECT_DIR, '.claude', 'handoffs');
const CURRENT_HANDOFF = path.join(PROJECT_DIR, '.claude', 'HANDOFF.md');

const PROJECT_NAME = path.basename(PROJECT_DIR);

// Create handoffs archive folder
if (!fs.existsSync(HANDOFF_DIR)) {
  fs.mkdirSync(HANDOFF_DIR, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dateDisplay = now.toLocaleString('en-US', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false
});

// Archive previous handoff if exists
if (fs.existsSync(CURRENT_HANDOFF)) {
  fs.renameSync(CURRENT_HANDOFF, path.join(HANDOFF_DIR, `handoff_${timestamp}.md`));
}

console.log('Gathering session data...');

// Get today's edits from session log
let todaysEdits = 'No edits logged today';
if (fs.existsSync(SESSION_LOG)) {
  const today = now.toISOString().slice(0, 10);
  const logContent = fs.readFileSync(SESSION_LOG, 'utf8');
  const lines = logContent.split('\n');
  const editLines = lines.filter(l => l.startsWith('- **') && l.includes(today));
  if (editLines.length > 0) {
    todaysEdits = editLines.slice(-20).join('\n');
  }
}

// Get pending/in-progress tasks
let pendingTasks = '_None_';
let inProgress = '_None_';
if (fs.existsSync(TASKS_FILE)) {
  const tasksContent = fs.readFileSync(TASKS_FILE, 'utf8');
  const pendingMatch = tasksContent.match(/^\s*-\s*\[ \].*/gm);
  const inProgressMatch = tasksContent.match(/^\s*-\s*\[~\].*/gm);

  if (pendingMatch) pendingTasks = pendingMatch.slice(0, 10).join('\n');
  if (inProgressMatch) inProgress = inProgressMatch.join('\n');
}

// Get recently modified files (simplified - just list the main files)
const recentFiles = ['index.html', 'styles.css', 'app.js', 'schedule.csv']
  .map(f => path.join(PROJECT_DIR, f))
  .filter(f => fs.existsSync(f))
  .join('\n') || 'None';

// Build handoff document
const handoff = `# Session Handoff

> Generated: ${dateDisplay}
> Project: ${PROJECT_NAME}

---

## Last Session Summary

**READ THIS FIRST** - Pick up exactly where we left off.

### What Was Being Worked On
<!-- Claude: Fill this in before saving -->
_Describe the current task/feature being worked on_

### Current State
<!-- Claude: Fill this in before saving -->
_Where did we leave off? What's the next step?_

### Key Decisions Made
<!-- Claude: Fill this in before saving -->
_Any important choices or approaches decided this session_

---

## Files Modified This Session
\`\`\`
${todaysEdits}
\`\`\`

## Project Files
\`\`\`
${recentFiles}
\`\`\`

---

## Tasks Status

### In Progress
${inProgress}

### Pending
${pendingTasks}

---

## Notes for Next Session
<!-- Claude: Add any context the next session needs -->

---

## Quick Resume Commands
\`\`\`bash
# Check the main files
cat index.html
cat styles.css
cat app.js

# Open in browser
open index.html
\`\`\`
`;

fs.writeFileSync(CURRENT_HANDOFF, handoff);

const divider = '━'.repeat(60);
console.log('');
console.log(divider);
console.log('SESSION HANDOFF CREATED: .claude/HANDOFF.md');
console.log(divider);
console.log('');
console.log('IMPORTANT: Before clearing, fill in the sections marked');
console.log("with 'Claude: Fill this in' so the next session has context.");
console.log('');
console.log('Then you can safely /clear or start a new session.');
console.log('');

process.exit(0);
