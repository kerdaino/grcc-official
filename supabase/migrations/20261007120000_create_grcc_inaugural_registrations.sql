create table public.grcc_inaugural_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_reference text not null unique
    check (registration_reference ~ '^GRCC-INA-[A-HJ-NP-Z2-9]{4}$'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (email is null or char_length(email) <= 160),
  location text not null check (char_length(location) between 2 and 160),
  church_ministry text check (church_ministry is null or char_length(church_ministry) <= 160),
  expected_sessions text[] not null check (
    cardinality(expected_sessions) > 0
    and expected_sessions <@ array[
      'Thursday — Pre-Conference', 'Friday', 'Saturday', 'Sunday', 'All Sessions'
    ]::text[]
    and (
      not ('All Sessions' = any(expected_sessions))
      or cardinality(expected_sessions) = 1
    )
  ),
  party_size integer not null check (party_size between 1 and 100),
  needs_accommodation boolean not null,
  accommodation_nights text[] not null default '{}'::text[] check (
    accommodation_nights <@ array['Thursday', 'Friday', 'Saturday']::text[]
  ),
  accommodation_people integer,
  needs_travel_guidance boolean not null,
  transport_mode text check (
    transport_mode is null or transport_mode in (
      'Private car', 'Public transport', 'Ride-hailing service',
      'Church/group bus', 'Not yet decided'
    )
  ),
  referral_source text check (referral_source is null or char_length(referral_source) <= 240),
  communication_consent boolean not null check (communication_consent = true),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  check (
    (needs_accommodation = true
      and cardinality(accommodation_nights) > 0
      and accommodation_people between 1 and party_size)
    or
    (needs_accommodation = false
      and cardinality(accommodation_nights) = 0
      and accommodation_people is null)
  ),
  check (
    (needs_travel_guidance = true and transport_mode is not null)
    or
    (needs_travel_guidance = false and transport_mode is null)
  )
);

create index grcc_inaugural_registrations_created_at_idx
  on public.grcc_inaugural_registrations (created_at desc);

create index grcc_inaugural_registrations_phone_idx
  on public.grcc_inaugural_registrations (phone);

alter table public.grcc_inaugural_registrations enable row level security;

-- Intentionally create no anon or authenticated policies. Public registration and
-- admin reads are performed only by controlled server routes using the service role.
