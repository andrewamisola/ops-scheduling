#!/usr/bin/env node
// Session Start: Load context + handoff + recent activity + pending tasks
// Cross-platform (Mac + Windows)

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CONTEXT_FILE = path.join(PROJECT_DIR, 'ai.context.md');
const SESSION_LOG = path.join(PROJECT_DIR, '.claude', 'SESSION_LOG.md');
const TASKS_FILE = path.join(PROJECT_DIR, '.claude', 'TASKS.md');
const HANDOFF_FILE = path.join(PROJECT_DIR, '.claude', 'HANDOFF.md');

const PROJECT_NAME = path.basename(PROJECT_DIR);

const divider = '━'.repeat(60);

console.log(divider);
console.log(`${PROJECT_NAME.toUpperCase()} - Claude Session Initialized`);
console.log(divider);

// CHECK FOR HANDOFF FIRST - This is the most important thing
if (fs.existsSync(HANDOFF_FILE)) {
  console.log('');
  console.log('!! HANDOFF FROM PREVIOUS SESSION !!');
  console.log(divider);
  console.log(fs.readFileSync(HANDOFF_FILE, 'utf8'));
  console.log('');
  console.log(divider);
  console.log('READ THE HANDOFF ABOVE - Resume from where we left off.');
  console.log('When done with this task, delete .claude/HANDOFF.md');
  console.log(divider);
  console.log('');
  process.exit(0);
}

// No handoff - show normal context
if (fs.existsSync(CONTEXT_FILE)) {
  console.log('');
  console.log(fs.readFileSync(CONTEXT_FILE, 'utf8'));
  console.log('');
}

// Show pending tasks if any
if (fs.existsSync(TASKS_FILE)) {
  const tasksContent = fs.readFileSync(TASKS_FILE, 'utf8');
  const pendingMatch = tasksContent.match(/^\s*-\s*\[ \].*/gm);
  const inProgressMatch = tasksContent.match(/^\s*-\s*\[~\].*/gm);

  const pending = pendingMatch ? pendingMatch.slice(0, 5).join('\n') : '';
  const inProgress = inProgressMatch ? inProgressMatch.slice(0, 3).join('\n') : '';

  if (inProgress || pending) {
    console.log(divider);
    console.log('PENDING WORK');
    console.log(divider);

    if (inProgress) {
      console.log('');
      console.log('In Progress:');
      console.log(inProgress);
    }

    if (pending) {
      console.log('');
      console.log('Pending:');
      console.log(pending);
    }
    console.log('');
  }
}

// Show recent session activity
if (fs.existsSync(SESSION_LOG)) {
  const logContent = fs.readFileSync(SESSION_LOG, 'utf8');
  const lines = logContent.split('\n');
  const recentEdits = lines.filter(l => /^\- \*\*\d{4}/.test(l)).slice(-5);

  if (recentEdits.length > 0) {
    console.log(divider);
    console.log('RECENT CHANGES (last 5)');
    console.log(divider);
    console.log('');
    console.log(recentEdits.join('\n'));
    console.log('');
  }
}

console.log('');
console.log('Save before clearing: /handoff');
console.log('');

process.exit(0);
