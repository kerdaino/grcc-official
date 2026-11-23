begin;

create table public.grcc_watch_hour_registrations (
  id uuid primary key default gen_random_uuid(),
  event_identifier text not null default 'december-watch-hour-2026'
    check (event_identifier = 'december-watch-hour-2026'),
  registration_reference text not null unique check (registration_reference ~ '^GRCC-WH-2026-[A-HJ-NP-Z2-9]{6}$'),
  idempotency_key uuid not null unique,
  submission_digest text not null check (submission_digest ~ '^[a-f0-9]{64}$'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (char_length(email) <= 160),
  location text not null check (char_length(location) between 2 and 160),
  attendance_mode text not null check (attendance_mode in ('physical', 'online', 'both')),
  attendance_duration text not null check (attendance_duration in ('entire', 'selected', 'uncertain')),
  attendance_dates date[] not null check (
    array_position(attendance_dates, null) is null
    and attendance_dates <@ array[
      '2026-12-01','2026-12-02','2026-12-03','2026-12-04','2026-12-05','2026-12-06','2026-12-07',
      '2026-12-08','2026-12-09','2026-12-10','2026-12-11','2026-12-12','2026-12-13','2026-12-14',
      '2026-12-15','2026-12-16','2026-12-17','2026-12-18','2026-12-19','2026-12-20','2026-12-21'
    ]::date[]
    and case attendance_duration
      when 'entire' then cardinality(attendance_dates) = 21
        and '2026-12-01'::date = attendance_dates[1]
        and '2026-12-21'::date = attendance_dates[21]
        and attendance_dates @> array[
          '2026-12-02','2026-12-03','2026-12-04','2026-12-05','2026-12-06','2026-12-07',
          '2026-12-08','2026-12-09','2026-12-10','2026-12-11','2026-12-12','2026-12-13','2026-12-14',
          '2026-12-15','2026-12-16','2026-12-17','2026-12-18','2026-12-19','2026-12-20'
        ]::date[]
      when 'selected' then cardinality(attendance_dates) between 1 and 21
      else cardinality(attendance_dates) = 0
    end
  ),
  party_size integer not null check (party_size between 1 and 100),
  physical_count integer not null check (physical_count between 0 and party_size),
  online_count integer not null check (online_count between 0 and party_size),
  check (case attendance_mode
    when 'physical' then physical_count = party_size and online_count = 0
    when 'online' then online_count = party_size and physical_count = 0
    else physical_count > 0 and online_count > 0 and physical_count + online_count >= party_size
  end),
  accommodation_preference text check (accommodation_preference in ('church', 'hotel', 'commute', 'undecided')),
  accommodation_arrival date,
  accommodation_departure date,
  accommodation_people integer,
  accommodation_men integer not null default 0 check (accommodation_men between 0 and 100),
  accommodation_women integer not null default 0 check (accommodation_women between 0 and 100),
  accommodation_family integer not null default 0 check (accommodation_family between 0 and 100),
  accommodation_status text check (accommodation_status in ('pending', 'confirmed', 'declined')),
  accessibility_request text check (char_length(accessibility_request) <= 300),
  needs_travel_guidance boolean not null default false,
  arrival_info text check (char_length(arrival_info) <= 300),
  welfare_status text not null check (welfare_status in ('none', 'pending', 'contacted', 'resolved')),
  communication_consent boolean not null check (communication_consent),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((attendance_mode = 'online') = (accommodation_preference is null)),
  check (attendance_mode <> 'online' or (not needs_travel_guidance and accessibility_request is null and arrival_info is null)),
  check (case when accommodation_preference = 'church' then
    accommodation_arrival is not null and accommodation_departure is not null
    and accommodation_arrival >= date '2026-12-01' and accommodation_departure <= date '2026-12-21'
    and accommodation_arrival < accommodation_departure
    and accommodation_people is not null and accommodation_people between 1 and physical_count
    and accommodation_men + accommodation_women + accommodation_family = accommodation_people
    and accommodation_status is not null
  else
    accommodation_arrival is null and accommodation_departure is null and accommodation_people is null
    and accommodation_men = 0 and accommodation_women = 0 and accommodation_family = 0
    and accommodation_status is null
  end),
  check ((welfare_status <> 'none') =
    (coalesce(accommodation_preference = 'church', false) or needs_travel_guidance or accessibility_request is not null))
);

create index grcc_watch_hour_registrations_created_idx
  on public.grcc_watch_hour_registrations (created_at desc, id desc);

alter table public.grcc_watch_hour_registrations enable row level security;
revoke all on public.grcc_watch_hour_registrations from public, anon, authenticated;
grant select, insert, update on public.grcc_watch_hour_registrations to service_role;

commit;
