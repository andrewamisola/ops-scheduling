#!/usr/bin/env node
// Pre-hook: Warnings before edits
// Cross-platform (Mac + Windows)

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path || '';

    // Warn about editing specific files
    if (filePath.includes('package.json')) {
      console.log('Note: Editing package.json - run npm install after changes.');
    }

    if (filePath.includes('.env')) {
      console.log('Warning: Editing environment file - do not commit secrets.');
    }

    if (filePath.includes('config')) {
      console.log('Note: Editing config - may require restart to take effect.');
    }

    if (filePath.includes('schedule.csv')) {
      console.log('Note: Editing schedule data - reload the app to see changes.');
    }

  } catch (e) {
    // Silently exit on parse errors
  }
  process.exit(0);
});
