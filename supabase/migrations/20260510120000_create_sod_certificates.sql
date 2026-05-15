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

create unique index if not exists sod_certificates_certificate_code_idx
  on public.sod_certificates(certificate_code);

create index if not exists sod_certificates_student_id_idx
  on public.sod_certificates(student_id);
