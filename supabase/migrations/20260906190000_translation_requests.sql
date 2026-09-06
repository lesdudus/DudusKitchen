-- Per-recipe translation request queue: a "Translate this" click logs a
-- request here rather than translating live (no AI API from the static
-- client). Actual translations are performed in a batch, agent-assisted pass.

create type translation_status as enum ('pending', 'done');

create table translation_requests (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     text not null unique,
  requested_by  text,
  requested_at  timestamptz not null default now(),
  status        translation_status not null default 'pending'
);

alter publication supabase_realtime add table translation_requests;

alter table translation_requests enable row level security;
create policy "anon full access" on translation_requests for all using (true) with check (true);
