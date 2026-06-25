# Sudoku Vue

A responsive Vue 3 Sudoku game with a Japanese minimalist cherry-blossom theme, uniquely solvable puzzles, four modes, advanced controls, shared Jivaro accounts, online rankings, Quanta rewards, and a validated cosmetic store.

## Game modes

- **Classic:** elapsed timer, mistake tracking, notes, undo, redo, and three hints
- **Daily Challenge:** one deterministic Medium puzzle per UTC date with local progress and one official ranked result
- **Timed Sprint:** 15 minutes on Easy, 10 minutes on Medium, and 7 minutes on Hard
- **Zen Mode:** no visible timer, no mistake count, no immediate error feedback, and no online ranking

## Online features

When the shared Jivaro Games Supabase project is configured:

- Email one-time-code sign-in
- Shared profile display name
- Persistent account session
- Classic, Daily, and Sprint leaderboards
- Permanent Quanta wallet
- Verified Quanta rewards
- Sudoku cosmetic shop
- Permanent inventory and equipped items

Guests may play every mode and earn session-only guest Quanta. Guest balances disappear when the browser session ends and are never merged into a permanent wallet.

## Store catalog

The Sakura Market includes:

- Six backgrounds
- Five board themes
- Four number styles
- Four petal packs
- Four completion effects
- Three control themes

All items are cosmetic. Purchases do not provide hints, extra time, mistake protection, or ranking advantages.

## Controls

- Select a cell by click, tap, or keyboard focus
- Enter numbers through the number pad or keyboard digits 1–9
- Arrow keys move the selected cell
- `Backspace` or `Delete` erases
- `N` toggles notes
- `H` uses a hint
- `Ctrl/Cmd + Z` undoes
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` redoes

## Requirements

- Node.js 18 or newer
- npm

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The game remains playable without Supabase values. Online account, ranking, permanent wallet, and purchase features require a configured backend.

## Testing and production build

```bash
npm run check
```

This runs all tests and builds the GitHub Pages output into `docs/`.

## Supabase deployment

Read `supabase/README.md` before applying anything.

The included files are:

- `supabase/migrations/202606250001_sudoku_online_store.sql`
- `supabase/functions/sudoku-run/`

Test the migration and Edge Function in the second Supabase project used as staging before applying them to the live Jivaro Games project.

## Local data

Browser local storage keeps local results, personal bests, Daily progress, and streaks. Session storage keeps temporary guest Quanta.

## GitHub Pages

The app keeps hash routing, `base: './'`, and the `/docs` production output. Publish the default branch from `/docs`.
