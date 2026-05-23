# Implementation Session: Issue #55 Seasonal Particles

Issue: https://github.com/andsaki/biotope/issues/55

Title: いつから雪とか桜とか降らなくなったの？？？

Initial findings:

- `SeasonalEffects` is still mounted from `App.tsx`.
- `CherryBlossoms` and `SnowEffect` are still conditionally rendered by season.
- Current spawn and reset heights place many particles high above the pond view.
- Spring petal fall speed is much slower than the original implementation.

Implementation:

- Lowered spring petal and winter snow spawn/reset bands so particles pass through the active camera view sooner.
- Increased petal/snow count, size, and opacity modestly to make falling effects visible again.
- Rendered snow and petals with `renderOrder`, `depthWrite={false}`, and `depthTest={false}` so transparent particles are not hidden behind scene geometry.

Verification:

- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Chrome DevTools Protocol smoke test captured spring/winter screenshots in this directory.
- Chrome MCP tools were not exposed in this Codex tool session despite searching for `chrome dev mcp`; CDP was used directly against local Chrome.
- Existing unrelated issue #31 frog/lily-pad changes make the dev scene very heavy in Chrome verification; the smoke test still reached a rendered scene and confirmed season switching.
