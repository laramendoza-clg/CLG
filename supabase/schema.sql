-- CapLink Studio — shared backend schema
-- ---------------------------------------------------------------------------
-- Run this whole file once in the Supabase SQL editor
-- (Dashboard -> project caplink-studio -> SQL editor -> New query -> paste -> Run).
--
-- It is IDEMPOTENT: safe to run again. It only creates what is missing and
-- (re)applies the access policies, so it will not disturb tables that already
-- exist (agendas, presence, milestones).
--
-- These tables are "public-write" on purpose: the Studio is an internal,
-- unlisted set of tools with no login, so the pages read and write with the
-- publishable (anon) key. Anyone who has the site URL can therefore read and
-- write these rows. That is fine for internal marketing content. The one thing
-- that is NOT public-write is agenda publishing, which stays behind the
-- publish_agenda() password RPC. Do not put anything sensitive in here.
-- ---------------------------------------------------------------------------

-- Small helpers to stamp the "who/when" columns on every insert or update.
create or replace function public.touch_at() returns trigger
  language plpgsql as $$ begin new.at = now(); return new; end; $$;
create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;


-- 1) milestones — dashboard ticks (id like "dubai-2026#22#email-campaign-1")
create table if not exists public.milestones (
  id       text primary key,
  done     boolean not null default false,
  by_name  text,
  at       timestamptz not null default now()
);

-- 2) tasks — one-off items quick-added from the dashboard
create table if not exists public.tasks (
  id       text primary key,
  label    text,
  slug     text,
  due      date,
  done     boolean not null default false,
  by_name  text,
  at       timestamptz not null default now()
);

-- 3) milestone_labels — editable per-event names for a milestone
--    (e.g. which panel a "Panel spotlight" email actually covers)
create table if not exists public.milestone_labels (
  id       text primary key,
  text     text,
  slug     text,
  by_name  text,
  at       timestamptz not null default now()
);

-- 4) studio_state — generic key/value store for the graphics tools
--    key   e.g. "panelspotlight:newyork-2026"  or  "speakergrid:dubai-2026"
--    data  the whole saved tool state as JSON (speakers, layout, images…)
create table if not exists public.studio_state (
  key         text primary key,
  data        jsonb,
  by_name     text,
  updated_at  timestamptz not null default now()
);


-- ---- refresh the timestamp on every update (upserts included) ----
drop trigger if exists milestones_touch       on public.milestones;
create trigger milestones_touch       before insert or update on public.milestones
  for each row execute function public.touch_at();

drop trigger if exists tasks_touch            on public.tasks;
create trigger tasks_touch            before insert or update on public.tasks
  for each row execute function public.touch_at();

drop trigger if exists milestone_labels_touch on public.milestone_labels;
create trigger milestone_labels_touch before insert or update on public.milestone_labels
  for each row execute function public.touch_at();

drop trigger if exists studio_state_touch     on public.studio_state;
create trigger studio_state_touch     before insert or update on public.studio_state
  for each row execute function public.touch_updated_at();


-- ---- access: let the anon + authenticated roles read/write these tables ----
grant select, insert, update, delete on public.milestones,
  public.tasks, public.milestone_labels, public.studio_state
  to anon, authenticated;

-- Row Level Security on, with permissive public policies (internal tool).
do $$
declare t text;
begin
  foreach t in array array['milestones','tasks','milestone_labels','studio_state']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists studio_public_all on public.%I', t);
    execute format(
      'create policy studio_public_all on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;
