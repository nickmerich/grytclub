do $$ begin
  create type public.prop_kind as enum ('clap', 'fire', 'muscle');
exception when duplicate_object then null; end $$;

create table if not exists public.member_props (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind public.prop_kind not null,
  created_at timestamptz not null default now(),
  unique (sender_id, recipient_id, kind),
  check (sender_id <> recipient_id)
);

create index if not exists member_props_recipient_idx on public.member_props (recipient_id);
create index if not exists member_props_sender_idx on public.member_props (sender_id);

grant select, insert, delete on public.member_props to authenticated;
grant all on public.member_props to service_role;

alter table public.member_props enable row level security;

drop policy if exists "props readable by authenticated" on public.member_props;
create policy "props readable by authenticated"
on public.member_props for select
to authenticated
using (true);

drop policy if exists "members send their own props to public profiles" on public.member_props;
create policy "members send their own props to public profiles"
on public.member_props for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = recipient_id and p.is_public = true
  )
);

drop policy if exists "senders can delete their prop" on public.member_props;
create policy "senders can delete their prop"
on public.member_props for delete
to authenticated
using (sender_id = auth.uid());

create or replace function public.get_recent_activity(_limit int default 12)
returns table (
  kind text,
  user_id uuid,
  display_name text,
  first_name text,
  avatar_url text,
  athlete_alignment text,
  title text,
  slug text,
  accent_color text,
  occurred_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with completions as (
    select
      'completion'::text as kind,
      c.user_id,
      ch.title,
      ch.slug,
      ch.accent_color,
      c.completed_at as occurred_at
    from public.challenge_step_completions c
    join public.challenges ch on ch.id = c.challenge_id
    where ch.published = true
    order by c.completed_at desc
    limit 30
  ),
  checkins as (
    select
      'checkin'::text as kind,
      ec.user_id,
      e.title,
      e.slug,
      '#0EA5E9'::text as accent_color,
      ec.checked_in_at as occurred_at
    from public.event_checkins ec
    join public.events e on e.id = ec.event_id
    where ec.user_id is not null
    order by ec.checked_in_at desc
    limit 30
  ),
  unioned as (
    select * from completions
    union all
    select * from checkins
  )
  select
    u.kind,
    u.user_id,
    p.display_name,
    p.first_name,
    p.avatar_url,
    p.athlete_alignment,
    u.title,
    u.slug,
    u.accent_color,
    u.occurred_at
  from unioned u
  join public.profiles p on p.id = u.user_id
  where p.is_public = true
  order by u.occurred_at desc
  limit greatest(1, least(_limit, 50));
$$;

revoke all on function public.get_recent_activity(int) from public;
grant execute on function public.get_recent_activity(int) to authenticated, service_role;