-- =============================================
-- Supabase one-time setup for Pool Room Live
-- Safe for re-runs (IF NOT EXISTS used)
-- =============================================

-- Fix for earlier error: these functions come from pgcrypto
create extension if not exists pgcrypto with schema public;

-- 1) Status enum
do $$ begin
  if not exists (select 1 from pg_type where typname = 'room_status') then
    create type room_status as enum ('green','yellow','red');
  end if;
end $$;

-- 2) Rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 80),
  status room_status not null default 'green',
  owner_id uuid not null references auth.users(id) on delete cascade,
  public_slug text not null unique default encode(gen_random_bytes(6), 'hex'),
  updated_at timestamptz not null default now()
);

-- 3) RLS + indexes
alter table public.rooms enable row level security;

create index if not exists rooms_owner_idx on public.rooms(owner_id);

-- Public can read (for the live board)
create policy if not exists "Public can read room status"
on public.rooms for select
to anon, authenticated
using (true);

-- Owners can modify their own rooms
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rooms' and policyname='Owners can update own rooms') then
    create policy "Owners can update own rooms"
    on public.rooms for update
    to authenticated
    using (auth.uid() = owner_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rooms' and policyname='Owners can insert own rooms') then
    create policy "Owners can insert own rooms"
    on public.rooms for insert
    to authenticated
    with check (auth.uid() = owner_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rooms' and policyname='Owners can delete own rooms') then
    create policy "Owners can delete own rooms"
    on public.rooms for delete
    to authenticated
    using (auth.uid() = owner_id);
  end if;
end $$;

-- 4) Keep updated_at fresh on any update
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.touch_updated_at();
