---
description: Save session state and prepare for clear/reset
allowed-tools: Bash, Edit, Write, Read
---

# Session Handoff

The user wants to save the current session state before clearing context.

**Do these steps in order:**

1. Run the save script:
   ```bash
   node .claude/hooks/session-save.js
   ```

2. Read the generated handoff file:
   ```bash
   cat .claude/HANDOFF.md
   ```

3. **Fill in the blank sections** in `.claude/HANDOFF.md`:
   - "What Was Being Worked On" - describe the current task
   - "Current State" - where we left off, what's the next step
   - "Key Decisions Made" - any important choices this session
   - "Notes for Next Session" - anything else important

4. Tell the user:
   > "Handoff saved. You can now type `/clear` to reset. The next session will pick up right where we left off."
