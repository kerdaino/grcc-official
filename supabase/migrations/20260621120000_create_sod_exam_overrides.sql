alter table public.sod_exams
  add column if not exists published_at timestamptz,
  add column if not exists available_until timestamptz;

update public.sod_exams
set
  published_at = coalesce(published_at, created_at, now()),
  available_until = coalesce(available_until, now() + interval '24 hours')
where is_published = true
  and available_until is null;

create table if not exists public.sod_exam_overrides (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.sod_students(id) on delete cascade,
  exam_id uuid not null references public.sod_exams(id) on delete cascade,
  available_until timestamptz not null,
  created_at timestamptz not null default now(),
  unique (student_id, exam_id)
);

create index if not exists sod_exam_overrides_student_id_idx
  on public.sod_exam_overrides(student_id);

create index if not exists sod_exam_overrides_exam_id_idx
  on public.sod_exam_overrides(exam_id);

create index if not exists sod_exam_overrides_available_until_idx
  on public.sod_exam_overrides(available_until);
