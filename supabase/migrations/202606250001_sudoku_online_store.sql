begin;

insert into public.games_catalog (game_key, display_name, description, active)
values ('sudoku', 'Sudoku', 'Japanese minimalist Sudoku with Classic, Daily, Sprint, and Zen modes.', true)
on conflict (game_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    active = excluded.active,
    updated_at = now();

create table if not exists public.sudoku_run_sessions (
  id uuid primary key default gen_random_uuid(),
  run_token uuid not null unique default gen_random_uuid(),
  client_run_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  difficulty text not null,
  puzzle_id text not null,
  puzzle jsonb not null,
  solution jsonb not null,
  daily_date date,
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  expires_at timestamptz not null,
  completed_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint sudoku_run_sessions_user_client_unique unique (user_id, client_run_id),
  constraint sudoku_run_sessions_mode_valid check (mode in ('classic', 'daily', 'sprint', 'zen')),
  constraint sudoku_run_sessions_difficulty_valid check (difficulty in ('easy', 'medium', 'hard')),
  constraint sudoku_run_sessions_status_valid check (status in ('active', 'completed', 'expired', 'rejected')),
  constraint sudoku_run_sessions_puzzle_array check (jsonb_typeof(puzzle) = 'array'),
  constraint sudoku_run_sessions_solution_array check (jsonb_typeof(solution) = 'array'),
  constraint sudoku_run_sessions_daily_valid check (
    (mode = 'daily' and daily_date is not null)
    or
    (mode <> 'daily' and daily_date is null)
  ),
  constraint sudoku_run_sessions_deadline_valid check (
    (mode = 'sprint' and deadline_at is not null)
    or
    (mode <> 'sprint' and deadline_at is null)
  )
);

create table if not exists public.sudoku_score_runs (
  id uuid primary key default gen_random_uuid(),
  run_session_id uuid not null unique references public.sudoku_run_sessions(id) on delete restrict,
  client_run_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  difficulty text not null,
  puzzle_id text not null,
  daily_date date,
  is_daily_official boolean not null default false,
  status text not null default 'completed',
  elapsed_seconds integer not null,
  time_remaining_seconds integer not null default 0,
  mistakes integer not null default 0,
  hints_used integer not null default 0,
  verification_level text not null default 'edge',
  quanta_awarded integer not null default 0,
  quanta_reward_status text not null default 'not_rewarded',
  created_at timestamptz not null default now(),
  constraint sudoku_score_runs_user_client_unique unique (user_id, client_run_id),
  constraint sudoku_score_runs_mode_valid check (mode in ('classic', 'daily', 'sprint', 'zen')),
  constraint sudoku_score_runs_difficulty_valid check (difficulty in ('easy', 'medium', 'hard')),
  constraint sudoku_score_runs_status_valid check (status = 'completed'),
  constraint sudoku_score_runs_elapsed_valid check (elapsed_seconds between 1 and 86400),
  constraint sudoku_score_runs_remaining_valid check (time_remaining_seconds between 0 and 3600),
  constraint sudoku_score_runs_mistakes_valid check (mistakes between 0 and 500),
  constraint sudoku_score_runs_hints_valid check (hints_used between 0 and 3),
  constraint sudoku_score_runs_verification_valid check (verification_level in ('edge', 'server')),
  constraint sudoku_score_runs_quanta_valid check (quanta_awarded between 0 and 1000),
  constraint sudoku_score_runs_daily_valid check (
    (mode = 'daily' and daily_date is not null)
    or
    (mode <> 'daily' and daily_date is null)
  )
);

create unique index if not exists sudoku_score_runs_one_daily_official_per_user_idx
  on public.sudoku_score_runs (user_id, daily_date)
  where mode = 'daily' and is_daily_official = true;

create index if not exists sudoku_score_runs_classic_rank_idx
  on public.sudoku_score_runs (mode, difficulty, elapsed_seconds, mistakes, hints_used, created_at)
  where mode = 'classic';

create index if not exists sudoku_score_runs_sprint_rank_idx
  on public.sudoku_score_runs (mode, difficulty, time_remaining_seconds desc, mistakes, hints_used, created_at)
  where mode = 'sprint';

create index if not exists sudoku_score_runs_daily_rank_idx
  on public.sudoku_score_runs (daily_date, elapsed_seconds, mistakes, hints_used, created_at)
  where mode = 'daily' and is_daily_official = true;

create table if not exists public.sudoku_shop_items (
  id text primary key,
  category text not null,
  equipment_slot text not null,
  name text not null,
  description text not null,
  price integer not null,
  active boolean not null default true,
  preview_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sudoku_shop_items_id_valid check (id ~ '^[a-z0-9-]{3,64}$'),
  constraint sudoku_shop_items_category_valid check (category in ('background', 'board', 'numbers', 'petals', 'completion', 'controls')),
  constraint sudoku_shop_items_slot_valid check (equipment_slot in ('background', 'board', 'numbers', 'petals', 'completion', 'controls')),
  constraint sudoku_shop_items_price_valid check (price between 0 and 100000),
  constraint sudoku_shop_items_preview_object check (jsonb_typeof(preview_metadata) = 'object')
);

create table if not exists public.sudoku_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  client_purchase_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.sudoku_shop_items(id) on delete restrict,
  price integer not null,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  constraint sudoku_purchase_orders_user_client_unique unique (user_id, client_purchase_id),
  constraint sudoku_purchase_orders_status_valid check (status in ('completed', 'refunded')),
  constraint sudoku_purchase_orders_price_valid check (price >= 0)
);

create table if not exists public.sudoku_user_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.sudoku_shop_items(id) on delete restrict,
  source_purchase_id uuid references public.sudoku_purchase_orders(id) on delete restrict,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.sudoku_equipped_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  equipment_slot text not null,
  item_id text not null references public.sudoku_shop_items(id) on delete restrict,
  equipped_at timestamptz not null default now(),
  primary key (user_id, equipment_slot),
  constraint sudoku_equipped_items_slot_valid check (equipment_slot in ('background', 'board', 'numbers', 'petals', 'completion', 'controls'))
);

create table if not exists public.sudoku_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint sudoku_security_events_severity_valid check (severity in ('info', 'warning', 'critical')),
  constraint sudoku_security_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists sudoku_purchase_orders_user_created_idx
  on public.sudoku_purchase_orders (user_id, created_at desc);

create index if not exists sudoku_inventory_user_idx
  on public.sudoku_user_inventory (user_id);

create index if not exists sudoku_security_events_user_created_idx
  on public.sudoku_security_events (user_id, created_at desc);

drop trigger if exists sudoku_shop_items_set_updated_at on public.sudoku_shop_items;
create trigger sudoku_shop_items_set_updated_at
before update on public.sudoku_shop_items
for each row
execute function public.set_updated_at();

alter table public.sudoku_run_sessions enable row level security;
alter table public.sudoku_score_runs enable row level security;
alter table public.sudoku_shop_items enable row level security;
alter table public.sudoku_purchase_orders enable row level security;
alter table public.sudoku_user_inventory enable row level security;
alter table public.sudoku_equipped_items enable row level security;
alter table public.sudoku_security_events enable row level security;

drop policy if exists sudoku_score_runs_select_own on public.sudoku_score_runs;
create policy sudoku_score_runs_select_own
on public.sudoku_score_runs
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists sudoku_shop_items_read_active on public.sudoku_shop_items;
create policy sudoku_shop_items_read_active
on public.sudoku_shop_items
for select
to anon, authenticated
using (active = true);

drop policy if exists sudoku_purchase_orders_select_own on public.sudoku_purchase_orders;
create policy sudoku_purchase_orders_select_own
on public.sudoku_purchase_orders
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists sudoku_inventory_select_own on public.sudoku_user_inventory;
create policy sudoku_inventory_select_own
on public.sudoku_user_inventory
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists sudoku_equipment_select_own on public.sudoku_equipped_items;
create policy sudoku_equipment_select_own
on public.sudoku_equipped_items
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.sudoku_run_sessions from public, anon, authenticated;
revoke all on public.sudoku_score_runs from public, anon, authenticated;
revoke all on public.sudoku_shop_items from public, anon, authenticated;
revoke all on public.sudoku_purchase_orders from public, anon, authenticated;
revoke all on public.sudoku_user_inventory from public, anon, authenticated;
revoke all on public.sudoku_equipped_items from public, anon, authenticated;
revoke all on public.sudoku_security_events from public, anon, authenticated;

grant select on public.sudoku_score_runs to authenticated;
grant select on public.sudoku_shop_items to anon, authenticated;
grant select on public.sudoku_purchase_orders to authenticated;
grant select on public.sudoku_user_inventory to authenticated;
grant select on public.sudoku_equipped_items to authenticated;

insert into public.sudoku_shop_items (id, category, equipment_slot, name, description, price, active, preview_metadata)
values
  ('sakura-sanctuary', 'background', 'background', 'Sakura Sanctuary', 'The original quiet garden among the blossoms.', 0, true, '{"assetKey":"sakura-sanctuary","preview":"image"}'),
  ('moon-garden', 'background', 'background', 'Moon Garden', 'A violet night, a patient moon, and suspiciously elegant hills.', 55, true, '{"assetKey":"moon-garden","preview":"image"}'),
  ('koi-sunset', 'background', 'background', 'Koi Sunset', 'Warm evening water with koi who refuse to solve row seven.', 65, true, '{"assetKey":"koi-sunset","preview":"image"}'),
  ('ink-mountain', 'background', 'background', 'Ink Mountain', 'Paper, mist, and mountains drawn with unnecessary confidence.', 45, true, '{"assetKey":"ink-mountain","preview":"image"}'),
  ('lantern-night', 'background', 'background', 'Lantern Night', 'Lanterns drift above a puzzle that definitely knows your mistakes.', 70, true, '{"assetKey":"lantern-night","preview":"image"}'),
  ('jade-mist', 'background', 'background', 'Jade Mist', 'A cool green valley wrapped in polite, mysterious fog.', 50, true, '{"assetKey":"jade-mist","preview":"image"}'),
  ('paper-white', 'board', 'board', 'Paper White', 'The clean original board with soft paper cells.', 0, true, '{"themeKey":"paper-white","preview":"#fffafc"}'),
  ('rose-grid', 'board', 'board', 'Rose Grid', 'Blush cells and deeper rose block lines.', 30, true, '{"themeKey":"rose-grid","preview":"#f7c9d6"}'),
  ('midnight-ink', 'board', 'board', 'Midnight Ink', 'A dark lacquer board with pale ink marks.', 50, true, '{"themeKey":"midnight-ink","preview":"#25222c"}'),
  ('jade-board', 'board', 'board', 'Jade Board', 'Muted jade tiles for methodical temple arithmetic.', 45, true, '{"themeKey":"jade-board","preview":"#b9d9cf"}'),
  ('lantern-gold', 'board', 'board', 'Lantern Gold', 'Warm ivory cells with restrained golden dividers.', 60, true, '{"themeKey":"lantern-gold","preview":"#f4dfaa"}'),
  ('classic-ink', 'numbers', 'numbers', 'Classic Ink', 'Crisp familiar digits with no dramatic monologue.', 0, true, '{"themeKey":"classic-ink","preview":"Aa"}'),
  ('brush-script', 'numbers', 'numbers', 'Brush Script', 'Bold brush-like numbers for theatrical deductions.', 25, true, '{"themeKey":"brush-script","preview":"九"}'),
  ('rounded-mochi', 'numbers', 'numbers', 'Rounded Mochi', 'Friendly rounded digits with snack-shaped optimism.', 20, true, '{"themeKey":"rounded-mochi","preview":"8"}'),
  ('mono-temple', 'numbers', 'numbers', 'Mono Temple', 'Monospaced numbers aligned with ceremonial precision.', 30, true, '{"themeKey":"mono-temple","preview":"123"}'),
  ('sakura-soft', 'petals', 'petals', 'Soft Sakura', 'The original pale pink petal shower.', 0, true, '{"themeKey":"sakura-soft","preview":"#f4a9ba"}'),
  ('moon-petals', 'petals', 'petals', 'Moon Petals', 'Cool violet petals for midnight solving.', 30, true, '{"themeKey":"moon-petals","preview":"#b9a3e3"}'),
  ('golden-petals', 'petals', 'petals', 'Golden Petals', 'Tiny drifting lantern sparks pretending to be flowers.', 35, true, '{"themeKey":"golden-petals","preview":"#f0c56b"}'),
  ('crimson-petals', 'petals', 'petals', 'Crimson Petals', 'A dramatic red shower for unnecessarily serious grids.', 40, true, '{"themeKey":"crimson-petals","preview":"#c85b6f"}'),
  ('blossom-burst', 'completion', 'completion', 'Blossom Burst', 'A restrained celebration of drifting petals.', 0, true, '{"themeKey":"blossom-burst","preview":"#f4a9ba"}'),
  ('lantern-spark', 'completion', 'completion', 'Lantern Spark', 'Warm sparks rise when the final number lands.', 35, true, '{"themeKey":"lantern-spark","preview":"#f0b56f"}'),
  ('ink-ripple', 'completion', 'completion', 'Ink Ripple', 'A calm black ripple approves your arithmetic.', 30, true, '{"themeKey":"ink-ripple","preview":"#343038"}'),
  ('koi-wave', 'completion', 'completion', 'Koi Wave', 'A coral wave sweeps across the completed board.', 45, true, '{"themeKey":"koi-wave","preview":"#ed7b70"}'),
  ('sakura-controls', 'controls', 'controls', 'Sakura Controls', 'The original pink paper controls.', 0, true, '{"themeKey":"sakura-controls","preview":"#f4a9ba"}'),
  ('moon-controls', 'controls', 'controls', 'Moon Controls', 'Deep violet controls with moonlit highlights.', 25, true, '{"themeKey":"moon-controls","preview":"#62527a"}'),
  ('jade-controls', 'controls', 'controls', 'Jade Controls', 'Cool jade controls with dark ink shadows.', 25, true, '{"themeKey":"jade-controls","preview":"#6d9e91"}')
on conflict (id) do update
set category = excluded.category,
    equipment_slot = excluded.equipment_slot,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    active = excluded.active,
    preview_metadata = excluded.preview_metadata,
    updated_at = now();

create or replace function public.sudoku_provision_default_items(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  default_item text;
  default_slot text;
begin
  if p_user_id is null then
    return;
  end if;

  foreach default_item in array array[
    'sakura-sanctuary',
    'paper-white',
    'classic-ink',
    'sakura-soft',
    'blossom-burst',
    'sakura-controls'
  ] loop
    insert into public.sudoku_user_inventory (user_id, item_id)
    values (p_user_id, default_item)
    on conflict (user_id, item_id) do nothing;
  end loop;

  for default_slot, default_item in
    select * from (values
      ('background', 'sakura-sanctuary'),
      ('board', 'paper-white'),
      ('numbers', 'classic-ink'),
      ('petals', 'sakura-soft'),
      ('completion', 'blossom-burst'),
      ('controls', 'sakura-controls')
    ) as defaults(equipment_slot, item_id)
  loop
    insert into public.sudoku_equipped_items (user_id, equipment_slot, item_id)
    values (p_user_id, default_slot, default_item)
    on conflict (user_id, equipment_slot) do nothing;
  end loop;
end;
$$;

create or replace function public.sudoku_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sudoku_provision_default_items(new.id);
  return new;
end;
$$;

drop trigger if exists sudoku_defaults_after_auth_user on auth.users;
create trigger sudoku_defaults_after_auth_user
after insert on auth.users
for each row
execute function public.sudoku_handle_new_auth_user();

select public.sudoku_provision_default_items(users.id)
from auth.users as users;

create or replace function public.sudoku_purchase_item(
  p_item_id text,
  p_client_purchase_id uuid
)
returns table (
  purchase_id uuid,
  item_id text,
  price integer,
  previous_balance integer,
  new_balance integer,
  inserted boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.sudoku_shop_items%rowtype;
  v_existing public.sudoku_purchase_orders%rowtype;
  v_wallet_balance integer;
  v_purchase_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if p_client_purchase_id is null then
    raise exception 'A client purchase ID is required.' using errcode = '22023';
  end if;

  select * into v_existing
  from public.sudoku_purchase_orders
  where user_id = v_user_id and client_purchase_id = p_client_purchase_id;

  if found then
    select balance into v_wallet_balance
    from public.quanta_wallets
    where user_id = v_user_id;

    return query select
      v_existing.id,
      v_existing.item_id,
      v_existing.price,
      greatest(0, coalesce(v_wallet_balance, 0)),
      greatest(0, coalesce(v_wallet_balance, 0)),
      false;
    return;
  end if;

  select * into v_item
  from public.sudoku_shop_items
  where id = p_item_id and active = true;

  if not found then
    raise exception 'This Sudoku store item is unavailable.' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.sudoku_user_inventory
    where user_id = v_user_id and item_id = v_item.id
  ) then
    raise exception 'You already own this item.' using errcode = '23505';
  end if;

  insert into public.quanta_wallets (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select balance into v_wallet_balance
  from public.quanta_wallets
  where user_id = v_user_id
  for update;

  if coalesce(v_wallet_balance, 0) < v_item.price then
    raise exception 'Not enough Quanta for this purchase.' using errcode = '22023';
  end if;

  insert into public.sudoku_purchase_orders (client_purchase_id, user_id, item_id, price)
  values (p_client_purchase_id, v_user_id, v_item.id, v_item.price)
  returning id into v_purchase_id;

  insert into public.sudoku_user_inventory (user_id, item_id, source_purchase_id)
  values (v_user_id, v_item.id, v_purchase_id);

  update public.quanta_wallets
  set balance = balance - v_item.price,
      lifetime_spent = lifetime_spent + v_item.price,
      updated_at = now()
  where user_id = v_user_id;

  if v_item.price > 0 then
    insert into public.quanta_transactions (
      user_id,
      amount,
      transaction_type,
      mode,
      description,
      balance_after,
      reward_date,
      metadata,
      source_game_key,
      source_event_id,
      is_daily_reward,
      source_mode
    )
    values (
      v_user_id,
      -v_item.price,
      'purchase',
      null,
      'Sudoku purchase: ' || v_item.name,
      v_wallet_balance - v_item.price,
      (now() at time zone 'utc')::date,
      jsonb_build_object('item_id', v_item.id, 'purchase_id', v_purchase_id),
      'sudoku',
      p_client_purchase_id,
      false,
      null
    );
  end if;

  return query select
    v_purchase_id,
    v_item.id,
    v_item.price,
    v_wallet_balance,
    v_wallet_balance - v_item.price,
    true;
end;
$$;

create or replace function public.sudoku_equip_item(
  p_item_id text,
  p_equipment_slot text
)
returns table (
  equipment_slot text,
  item_id text,
  equipped_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.sudoku_shop_items%rowtype;
  v_equipped_at timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into v_item
  from public.sudoku_shop_items
  where id = p_item_id and active = true;

  if not found then
    raise exception 'This Sudoku store item is unavailable.' using errcode = '22023';
  end if;

  if v_item.equipment_slot <> p_equipment_slot then
    raise exception 'This item cannot be equipped in that slot.' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.sudoku_user_inventory
    where user_id = v_user_id and item_id = v_item.id
  ) then
    raise exception 'You do not own this item.' using errcode = '42501';
  end if;

  insert into public.sudoku_equipped_items (user_id, equipment_slot, item_id, equipped_at)
  values (v_user_id, p_equipment_slot, v_item.id, v_equipped_at)
  on conflict (user_id, equipment_slot) do update
  set item_id = excluded.item_id,
      equipped_at = excluded.equipped_at;

  return query select p_equipment_slot, v_item.id, v_equipped_at;
end;
$$;

create or replace function public.sudoku_get_leaderboard(
  p_mode text default 'classic',
  p_difficulty text default 'easy',
  p_daily_date date default null,
  p_limit integer default 25
)
returns table (
  leaderboard_rank bigint,
  display_name text,
  elapsed_seconds integer,
  time_remaining_seconds integer,
  mistakes integer,
  hints_used integer,
  created_at timestamptz,
  is_current_user boolean
)
language sql
security definer
set search_path = public
as $$
  with filtered as (
    select runs.*
    from public.sudoku_score_runs as runs
    where runs.status = 'completed'
      and p_mode in ('classic', 'daily', 'sprint')
      and runs.mode = p_mode
      and (
        (p_mode = 'daily' and runs.daily_date = coalesce(p_daily_date, (now() at time zone 'utc')::date) and runs.is_daily_official = true)
        or
        (p_mode <> 'daily' and runs.difficulty = p_difficulty)
      )
  ),
  best_per_user as (
    select filtered.*,
      row_number() over (
        partition by filtered.user_id
        order by
          case when p_mode = 'sprint' then filtered.time_remaining_seconds end desc nulls last,
          case when p_mode <> 'sprint' then filtered.elapsed_seconds end asc nulls last,
          filtered.mistakes asc,
          filtered.hints_used asc,
          filtered.created_at asc
      ) as user_best
    from filtered
  ),
  ranked as (
    select best_per_user.*,
      rank() over (
        order by
          case when p_mode = 'sprint' then best_per_user.time_remaining_seconds end desc nulls last,
          case when p_mode <> 'sprint' then best_per_user.elapsed_seconds end asc nulls last,
          best_per_user.mistakes asc,
          best_per_user.hints_used asc,
          best_per_user.created_at asc
      ) as leaderboard_rank
    from best_per_user
    where user_best = 1
  ),
  visible as (
    select ranked.*
    from ranked
    where ranked.leaderboard_rank <= greatest(1, least(coalesce(p_limit, 25), 100))
       or ranked.user_id = auth.uid()
  )
  select
    visible.leaderboard_rank,
    coalesce(profiles.display_name, 'Player') as display_name,
    visible.elapsed_seconds,
    visible.time_remaining_seconds,
    visible.mistakes,
    visible.hints_used,
    visible.created_at,
    visible.user_id = auth.uid() as is_current_user
  from visible
  join public.profiles as profiles on profiles.user_id = visible.user_id
  order by visible.leaderboard_rank, visible.created_at;
$$;

create or replace function public.sudoku_finalize_run(
  p_user_id uuid,
  p_run_token uuid,
  p_client_run_id uuid,
  p_mistakes integer,
  p_hints_used integer
)
returns table (
  run_id uuid,
  daily_official boolean,
  inserted boolean,
  quanta_awarded integer,
  previous_balance integer,
  new_balance integer,
  reward_status text,
  reward_message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sudoku_run_sessions%rowtype;
  v_existing public.sudoku_score_runs%rowtype;
  v_run_id uuid;
  v_now timestamptz := now();
  v_elapsed integer;
  v_remaining integer := 0;
  v_daily_official boolean := false;
  v_reward integer := 0;
  v_reward_status text := 'not_rewarded';
  v_reward_message text := 'No Quanta were awarded.';
  v_previous_balance integer := 0;
  v_new_balance integer := 0;
  v_non_daily_count integer := 0;
  v_daily_paid boolean := false;
begin
  if p_user_id is null or p_run_token is null or p_client_run_id is null then
    raise exception 'A verified user and run are required.' using errcode = '22023';
  end if;

  if p_mistakes < 0 or p_mistakes > 500 or p_hints_used < 0 or p_hints_used > 3 then
    raise exception 'Run metrics are outside the accepted range.' using errcode = '22023';
  end if;

  select * into v_session
  from public.sudoku_run_sessions
  where run_token = p_run_token
    and user_id = p_user_id
    and client_run_id = p_client_run_id
  for update;

  if not found then
    raise exception 'The verified Sudoku run was not found.' using errcode = '22023';
  end if;

  select * into v_existing
  from public.sudoku_score_runs
  where user_id = p_user_id and client_run_id = p_client_run_id;

  if found then
    select balance into v_new_balance from public.quanta_wallets where user_id = p_user_id;
    return query select
      v_existing.id,
      v_existing.is_daily_official,
      false,
      v_existing.quanta_awarded,
      greatest(0, coalesce(v_new_balance, 0) - v_existing.quanta_awarded),
      greatest(0, coalesce(v_new_balance, 0)),
      case when v_existing.quanta_reward_status = 'rewarded' then 'already_rewarded' else v_existing.quanta_reward_status end,
      'This verified run was already processed.';
    return;
  end if;

  if v_session.status <> 'active' then
    raise exception 'This Sudoku run is no longer active.' using errcode = '22023';
  end if;

  if v_now > v_session.expires_at then
    update public.sudoku_run_sessions set status = 'expired' where id = v_session.id;
    raise exception 'This Sudoku run has expired.' using errcode = '22023';
  end if;

  if v_session.mode = 'sprint' and v_session.deadline_at is not null and v_now > v_session.deadline_at then
    update public.sudoku_run_sessions set status = 'expired' where id = v_session.id;
    raise exception 'The Sprint timer expired before completion.' using errcode = '22023';
  end if;

  v_elapsed := greatest(1, floor(extract(epoch from (v_now - v_session.started_at)))::integer);

  if v_session.mode = 'sprint' and v_session.deadline_at is not null then
    v_remaining := greatest(0, floor(extract(epoch from (v_session.deadline_at - v_now)))::integer);
  end if;

  if v_session.mode = 'daily' then
    v_daily_official := not exists (
      select 1 from public.sudoku_score_runs
      where user_id = p_user_id
        and mode = 'daily'
        and daily_date = v_session.daily_date
        and is_daily_official = true
    );
  end if;

  insert into public.sudoku_score_runs (
    run_session_id,
    client_run_id,
    user_id,
    mode,
    difficulty,
    puzzle_id,
    daily_date,
    is_daily_official,
    elapsed_seconds,
    time_remaining_seconds,
    mistakes,
    hints_used,
    verification_level
  )
  values (
    v_session.id,
    v_session.client_run_id,
    v_session.user_id,
    v_session.mode,
    v_session.difficulty,
    v_session.puzzle_id,
    v_session.daily_date,
    v_daily_official,
    v_elapsed,
    v_remaining,
    p_mistakes,
    p_hints_used,
    'edge'
  )
  returning id into v_run_id;

  insert into public.quanta_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select balance into v_previous_balance
  from public.quanta_wallets
  where user_id = p_user_id
  for update;

  select count(*)::integer into v_non_daily_count
  from public.quanta_transactions
  where user_id = p_user_id
    and transaction_type = 'run_reward'
    and is_daily_reward = false
    and reward_date = (v_now at time zone 'utc')::date;

  select exists (
    select 1 from public.quanta_transactions
    where user_id = p_user_id
      and transaction_type = 'run_reward'
      and source_game_key = 'sudoku'
      and is_daily_reward = true
      and reward_date = (v_now at time zone 'utc')::date
  ) into v_daily_paid;

  v_reward := case
    when v_session.mode = 'daily' then 4
    when v_session.mode = 'classic' and v_session.difficulty = 'easy' then 1
    when v_session.mode = 'classic' and v_session.difficulty = 'medium' then 2
    when v_session.mode = 'classic' and v_session.difficulty = 'hard' then 3
    when v_session.mode = 'sprint' and v_session.difficulty = 'easy' then 2
    when v_session.mode = 'sprint' and v_session.difficulty = 'medium' then 3
    when v_session.mode = 'sprint' and v_session.difficulty = 'hard' then 4
    when v_session.mode = 'zen' then 1
    else 0
  end;

  if v_session.mode = 'daily' and not v_daily_official then
    v_reward := 0;
    v_reward_status := 'daily_already_paid';
    v_reward_message := 'Practice Daily result saved. Today’s official Daily reward was already claimed.';
  elsif v_session.mode = 'daily' and v_daily_paid then
    v_reward := 0;
    v_reward_status := 'daily_already_paid';
    v_reward_message := 'Today’s Sudoku Daily reward was already claimed.';
  elsif v_session.mode <> 'daily' and v_non_daily_count >= 10 then
    v_reward := 0;
    v_reward_status := 'daily_cap_reached';
    v_reward_message := 'The shared daily limit of ten rewarded non-Daily clears has been reached.';
  elsif v_reward > 0 then
    v_reward_status := 'rewarded';
    v_reward_message := 'Verified Sudoku clear rewarded with ' || v_reward || ' Quanta.';
  end if;

  v_new_balance := v_previous_balance;

  if v_reward > 0 then
    v_new_balance := v_previous_balance + v_reward;

    update public.quanta_wallets
    set balance = v_new_balance,
        lifetime_earned = lifetime_earned + v_reward,
        updated_at = now()
    where user_id = p_user_id;

    insert into public.quanta_transactions (
      user_id,
      amount,
      transaction_type,
      mode,
      score_run_id,
      description,
      balance_after,
      reward_date,
      metadata,
      source_game_key,
      source_event_id,
      is_daily_reward,
      source_mode
    )
    values (
      p_user_id,
      v_reward,
      'run_reward',
      null,
      null,
      'Sudoku verified run reward',
      v_new_balance,
      (v_now at time zone 'utc')::date,
      jsonb_build_object('sudoku_run_id', v_run_id, 'difficulty', v_session.difficulty),
      'sudoku',
      v_run_id,
      v_session.mode = 'daily',
      v_session.mode
    );
  end if;

  update public.sudoku_score_runs
  set quanta_awarded = v_reward,
      quanta_reward_status = v_reward_status
  where id = v_run_id;

  update public.sudoku_run_sessions
  set status = 'completed', completed_at = v_now
  where id = v_session.id;

  return query select
    v_run_id,
    v_daily_official,
    true,
    v_reward,
    v_previous_balance,
    v_new_balance,
    v_reward_status,
    v_reward_message;
end;
$$;

revoke all on function public.sudoku_provision_default_items(uuid) from public, anon, authenticated;
revoke all on function public.sudoku_handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.sudoku_purchase_item(text, uuid) from public, anon;
revoke all on function public.sudoku_equip_item(text, text) from public, anon;
revoke all on function public.sudoku_get_leaderboard(text, text, date, integer) from public;
revoke all on function public.sudoku_finalize_run(uuid, uuid, uuid, integer, integer) from public, anon, authenticated;

grant execute on function public.sudoku_purchase_item(text, uuid) to authenticated;
grant execute on function public.sudoku_equip_item(text, text) to authenticated;
grant execute on function public.sudoku_get_leaderboard(text, text, date, integer) to anon, authenticated;
grant execute on function public.sudoku_finalize_run(uuid, uuid, uuid, integer, integer) to service_role;

commit;
