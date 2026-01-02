#!/usr/bin/env node
// Post-hook: Validate files after edits
// Cross-platform (Mac + Windows)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path;

    if (!filePath || !fs.existsSync(filePath)) process.exit(0);

    // Validate JSON files
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.log(`INVALID JSON: ${filePath}`);
        console.log(e.message);
        process.exit(1);
      }
    }

    // Syntax check JavaScript files
    if (filePath.endsWith('.js')) {
      try {
        execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
      } catch (e) {
        console.log(`SYNTAX ERROR in: ${filePath}`);
        console.log(e.stderr?.toString() || e.message);
        process.exit(1);
      }
    }

    // Validate HTML (basic check - just ensure it's not empty)
    if (filePath.endsWith('.html')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('<html') && !content.includes('<!doctype')) {
        console.log(`WARNING: ${filePath} may not be valid HTML`);
      }
    }

    // Validate CSS (basic check - ensure braces match)
    if (filePath.endsWith('.css')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        console.log(`WARNING: ${filePath} has mismatched braces ({${openBraces} vs }${closeBraces})`);
      }
    }

  } catch (e) {
    // Silently exit on parse errors
  }
  process.exit(0);
});
