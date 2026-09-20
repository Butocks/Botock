# Context: Challenger 2

Role: Empirical stress tester and boundary verifier.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_challenger_2/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Test suite readiness: /home/mir/Documents/botock/.agents/TEST_READY.md
Project plan: /home/mir/Documents/botock/.agents/PROJECT.md

Task:
Empirically test crash resilience, memory safety, and isolation boundaries:
1. Verify Error Boundaries: Test `error.tsx` in all 5 tools to ensure crashes are localized and call `reset()`.
2. Verify isolation: Ensure 100% client-side execution with zero external network leaks.
3. Verify production build: Run `npm run build` and `node scripts/test-e2e.mjs --strict`.
4. Deliver verdict in `/home/mir/Documents/botock/.agents/teamwork_preview_challenger_2/handoff.md`: APPROVE or REJECT.
