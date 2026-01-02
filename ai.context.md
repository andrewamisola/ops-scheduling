# Ops Scheduling — AI Context

## What is this?
Web-based shift scheduling app for requesting coverage and proposing swaps within a team.

## Stack
- Vanilla JavaScript (single-page app)
- HTML5 / CSS3 (CSS variables, Flexbox, Grid)
- No framework, no bundler
- CSV for schedule data

## Key Files
```
index.html        # Main HTML structure
styles.css        # All styling (Disney-blue theme)
app.js            # All application logic
schedule.csv      # Team schedule data
```

## Commands
| Command | What it does |
|---------|--------------|
| `open index.html` | Open in browser |
| `/handoff` | Save session state before clearing |

## Architecture

### State Management
All state in single `state` object in app.js:
- `currentUser` - logged in user
- `role` - 'Operator' or 'Lead'
- `roster` - parsed schedule data
- `coverageRequests` - all posted requests
- `approvals` - pending lead approvals

### UI Modes
- **Operator View**: Request coverage, propose swaps, respond to requests
- **Lead View**: Dark header + gold accents, approve/deny pending requests

### Smart Filtering
- Bulletin shows only requests user can take (they're OFF that day)
- Swaps only show shifts where requester is also OFF
- "Show all requests" toggle for viewing non-applicable requests (greyed out)

## Design System
- **Primary**: #1E88E5 (Disney blue)
- **Secondary**: #1565C0 (deeper blue)
- **Gold accent**: #FFD700 (Lead mode)
- **Font**: System fonts (Avenir preferred)
- **Pattern**: Left sidebar (360px) + Main calendar area

## Flow
1. Login (pseudo-auth with name/password)
2. See weekly calendar with your shifts
3. Click shift to request coverage or propose swap
4. Available people (those OFF) are auto-detected
5. Post to bulletin, others can respond
6. Leads approve/deny in Lead mode

## Session Management

**Before clearing/compacting**, save session state:
```bash
/handoff
```

The next session will automatically load the handoff and resume.

**After completing a handoff task**, delete it:
```bash
rm .claude/HANDOFF.md
```

## Response Format

When completing a task or investigating an issue:

1. **Mission** - What was I asked to do?
2. **Found** - What did I discover?
3. **Did** - What actions did I take?
4. **Diff** - How does it differ from before?

## Notes
- All edits logged to `.claude/SESSION_LOG.md`
- Tasks tracked in `.claude/TASKS.md`
- This is a prototype - no real backend
