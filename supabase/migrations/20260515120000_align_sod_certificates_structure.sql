create table if not exists public.sod_certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.sod_students(id) on delete cascade,
  certificate_type text not null check (
    certificate_type in (
      'Certificate of Completion',
      'Certificate of Participation'
    )
  ),
  overall_score numeric(5, 2) not null default 0,
  quiz_average numeric(5, 2) not null default 0,
  exam_score numeric(5, 2) not null default 0,
  certificate_code text not null unique,
  verification_url text,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (student_id)
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sod_certificates'
      and column_name = 'code'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sod_certificates'
      and column_name = 'certificate_code'
  ) then
    alter table public.sod_certificates
      rename column code to certificate_code;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sod_certificates'
      and column_name = 'overall_percentage'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sod_certificates'
      and column_name = 'overall_score'
  ) then
    alter table public.sod_certificates
      rename column overall_percentage to overall_score;
  end if;
end $$;

alter table public.sod_certificates
  add column if not exists overall_score numeric(5, 2) not null default 0,
  add column if not exists quiz_average numeric(5, 2) not null default 0,
  add column if not exists exam_score numeric(5, 2) not null default 0,
  add column if not exists certificate_code text,
  add column if not exists verification_url text,
  add column if not exists issued_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now();

update public.sod_certificates
set certificate_code = concat('SOD-', extract(year from now())::int, '-', replace(id::text, '-', ''))
where certificate_code is null;

alter table public.sod_certificates
  alter column certificate_code set not null;

alter table public.sod_certificates
  drop column if exists student_name,
  drop column if exists program_name,
  drop column if exists organization_name,
  drop column if exists completion_date,
  drop column if exists admin_acknowledgement,
  drop column if exists updated_at;

drop index if exists public.sod_certificates_code_idx;

create unique index if not exists sod_certificates_certificate_code_idx
  on public.sod_certificates(certificate_code);

create index if not exists sod_certificates_student_id_idx
  on public.sod_certificates(student_id);
