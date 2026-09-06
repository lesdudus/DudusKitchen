-- Dudu's Kitchen: shared/interactive data (recipes themselves stay in
-- src/data/recipes-json/*.json — see backlog.html for the rationale).

create type recipe_reaction as enum ('never_again', 'dislike', 'neutral', 'like', 'love');
create type meal_type as enum ('breakfast', 'lunch', 'snack', 'dinner');
create type list_status as enum ('active', 'completed', 'archived');

-- One row per recipe, shared by both household members (no per-user column).
create table recipe_status (
  recipe_id   text primary key,
  status      recipe_reaction not null default 'neutral',
  updated_by  text,
  updated_at  timestamptz not null default now()
);

create table recipe_comments (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   text not null,
  author      text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table cooking_history (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   text not null,
  cooked_at   timestamptz not null default now(),
  cooked_by   text,
  notes       text
);

create table meal_plans (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null,
  notes       text
);

create table meal_plan_recipes (
  id            uuid primary key default gen_random_uuid(),
  meal_plan_id  uuid not null references meal_plans(id) on delete cascade,
  recipe_id     text not null,
  planned_date  date not null,
  meal_type     meal_type not null
);

create table shopping_lists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  status      list_status not null default 'active',
  created_at  timestamptz not null default now()
);

create table shopping_list_items (
  id                uuid primary key default gen_random_uuid(),
  shopping_list_id  uuid not null references shopping_lists(id) on delete cascade,
  ingredient_name   text not null,
  quantity          text,
  checked           boolean not null default false
);

-- Placeholder for future AI-generated suggestions; payload shape may evolve.
create table ai_recommendations (
  id               uuid primary key default gen_random_uuid(),
  recipe_id        text,
  suggestion_type  text not null,
  payload          jsonb not null,
  created_at       timestamptz not null default now(),
  dismissed        boolean not null default false
);

-- Realtime: broadcast changes on the two tables the app subscribes to today.
alter publication supabase_realtime add table recipe_status;
alter publication supabase_realtime add table recipe_comments;

-- RLS: shared household app, no real per-user auth. Enable RLS with a single
-- permissive policy per table so anon-key access works but the tables aren't
-- silently left wide open at the Postgres level (defense in depth).
alter table recipe_status enable row level security;
alter table recipe_comments enable row level security;
alter table cooking_history enable row level security;
alter table meal_plans enable row level security;
alter table meal_plan_recipes enable row level security;
alter table shopping_lists enable row level security;
alter table shopping_list_items enable row level security;
alter table ai_recommendations enable row level security;

create policy "anon full access" on recipe_status for all using (true) with check (true);
create policy "anon full access" on recipe_comments for all using (true) with check (true);
create policy "anon full access" on cooking_history for all using (true) with check (true);
create policy "anon full access" on meal_plans for all using (true) with check (true);
create policy "anon full access" on meal_plan_recipes for all using (true) with check (true);
create policy "anon full access" on shopping_lists for all using (true) with check (true);
create policy "anon full access" on shopping_list_items for all using (true) with check (true);
create policy "anon full access" on ai_recommendations for all using (true) with check (true);
