# Implementation Session: Issue #53 How To Play Label

Issue: https://github.com/andsaki/biotope/issues/53

Title: 初めての歩き方？

Body: 遊び方では？

Initial finding:

- The onboarding panel heading is rendered as `はじめての歩き方` in `src/components/UI.tsx`.

Implementation:

- Changed the onboarding panel heading to `遊び方`.

Verification:

- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Chrome DevTools Protocol smoke test was run against the dev server. It captured `desktop.png`; because the current worktree also contains unrelated issue #31 heavy model changes, the onboarding panel was still behind the loading state during the short smoke check, so the final text verification is based on the rendered `UI.tsx` source and successful build.
