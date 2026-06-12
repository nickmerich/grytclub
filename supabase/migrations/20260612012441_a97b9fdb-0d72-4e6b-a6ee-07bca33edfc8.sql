create table public.run_recaps (
  event_id uuid primary key references public.events(id) on delete cascade,
  attendee_count integer not null default 0,
  distance_mi numeric,
  vibe_word text,
  hero_caption text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.run_recaps to anon, authenticated;
grant all on public.run_recaps to service_role;

alter table public.run_recaps enable row level security;

create policy "Public can read published recaps"
  on public.run_recaps for select
  to anon, authenticated
  using (published = true);

create trigger run_recaps_set_updated_at
  before update on public.run_recaps
  for each row execute function public.update_updated_at_column();