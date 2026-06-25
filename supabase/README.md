# Sudoku Supabase integration

This project is designed for the shared **Jivaro Games** Supabase project.

Shared data remains in the existing tables:

- `profiles`
- `quanta_wallets`
- `quanta_transactions`
- `games_catalog`

Sudoku-specific online data is stored in prefixed tables:

- `sudoku_run_sessions`
- `sudoku_score_runs`
- `sudoku_shop_items`
- `sudoku_purchase_orders`
- `sudoku_user_inventory`
- `sudoku_equipped_items`
- `sudoku_security_events`

## Important rollout rule

The connected production project currently has no Sudoku tables and no Edge Functions. The included migration and function source were prepared without changing production.

Use the second Supabase project as staging before production:

1. Create or select the staging project.
2. Apply the shared Jivaro migrations that staging needs.
3. Run `supabase/migrations/202606250001_sudoku_online_store.sql` in staging.
4. Deploy `supabase/functions/sudoku-run` in staging with JWT verification enabled.
5. Test account login, score saving, rankings, Quanta rewards, purchases, duplicate protection, inventory, and equipment.
6. Apply the exact migration to the Jivaro Games production project.
7. Deploy the same Edge Function to production.
8. Configure production environment variables and rebuild the Vue app.

## Vue environment

Copy `.env.example` to `.env.local` and set the shared publishable key:

```text
VITE_SUPABASE_URL=https://dsjntffwqludoxrcykoi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_AUTH_STORAGE_KEY=chronogame-supabase-auth
```

The auth storage key must match other Jivaro games that should recognize the same browser session on the same origin.

Never place a secret key or service-role key in a `VITE_` variable.

## Authentication setup

The frontend uses email one-time codes like ChronoGame.

In Supabase:

1. Enable the Email provider.
2. Allow new users to sign up.
3. Configure the Magic Link email template to display `{{ .Token }}` as a code.
4. Add local and production URLs to Authentication URL Configuration.
5. Configure custom SMTP before public launch.

## Edge Function

The `sudoku-run` function has two authenticated actions:

- `start`: creates a verified server run and returns its puzzle.
- `complete`: verifies the final grid against the server session, then calls the protected finalization RPC.

Deploy with JWT verification enabled. Supabase provides these server-only environment values automatically:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key must stay inside the Edge Function environment.

## Security design

- The browser cannot insert official score rows.
- The browser cannot write wallets or Quanta transactions.
- Prices are loaded by the purchase RPC, not trusted from Vue.
- Purchase and inventory writes occur in one database transaction.
- Duplicate purchases are blocked by unique constraints.
- Equipment changes verify both ownership and slot compatibility.
- Verified runs use unique client IDs and server run tokens.
- Daily and non-Daily reward limits are enforced in the database.
- Leaderboards expose display names and result summaries, never emails.
- Zen Mode remains unranked; signed-in verified clears may still receive the configured permanent Quanta reward.

## Generated shop backgrounds

The Vue project includes five generated SVG backgrounds plus the original Sakura background. The database stores stable item IDs and preview metadata; the actual files are bundled by Vite.
