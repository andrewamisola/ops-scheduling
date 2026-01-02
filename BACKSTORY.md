# Ops Scheduling — Why This Exists

## Problem (today)
- Global sports ops teams juggle shifting event hours and time zones, so coverage needs appear unpredictably.
- Coverage requests rely on mass emails/DMs; volunteers must manually check if they are actually off.
- Leads get fragmented approvals and no single source of truth.

## What the prototype solves
- One place to see your week, ask for coverage, propose swaps, and respond.
- Only shows people who can realistically help (off that day), reducing noise.
- Leads review and approve in one queue instead of email threads.

## Flow (demo)
1. Sign in with a demo name + `password`.
2. See your week (default schedule seeded; CSV upload is supported in Lead view).
3. Click a shift to request coverage or propose a trade.
4. Others see applicable requests in the Bulletin; they can offer coverage or a swap.
5. Leads approve/deny; status updates are reflected in the UI.

## Roles
- **Operator:** Post requests, respond to others, view your shifts.
- **Lead:** Approve/deny, upload schedules, see pending swaps.

## Time zones
- Prototype displays in ET or PT for clarity; source data is stored with its zone label.
- For the initial pitch, we center on Eastern to match current practice.

## Why this helps Disney ops
- Fewer mass emails; faster fills for last‑minute events.
- Clear accountability trail (who requested, who responded, lead decision).
- Fits existing patterns: can be paired with email/SMS notifications later; SSO could replace the demo login.

## Demo notes
- Seed data and requests live in memory; refresh resets state.
- CSV format: `Name,Monday,...,Sunday` with time ranges like `10:00-18:00 ET` or `OFF`.
- Demo credentials listed in `app.js` (all `password`).

## Future hooks (for discussion)
- Persist requests/approvals (e.g., API + audit log).
- Notifications: email/SMS/Teams with opt-in.
- Full IANA timezone support and UTC normalization.
- SSO integration and role-based access.
