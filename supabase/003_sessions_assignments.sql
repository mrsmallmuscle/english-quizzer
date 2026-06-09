-- ============================================================
-- Migration 003: quiz_sessions + assignments
-- Chạy trong Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Bảng quiz_sessions
create table if not exists quiz_sessions (
  id           bigserial primary key,
  user_id      uuid references profiles(id) on delete cascade not null,
  curriculum   text,
  unit         text,
  score        int not null,
  total        int not null,
  pct          int not null,
  answers      jsonb not null default '[]',
  played_at    timestamptz default now()
);

create index if not exists idx_sessions_user    on quiz_sessions(user_id, played_at desc);
create index if not exists idx_sessions_played  on quiz_sessions(played_at desc);

alter table quiz_sessions enable row level security;

create policy "Users manage own sessions"
  on quiz_sessions for all
  using (user_id = auth.uid());

create policy "Admin reads all sessions"
  on quiz_sessions for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 2. Bảng assignments
create table if not exists assignments (
  id           bigserial primary key,
  student_id   uuid references profiles(id) on delete cascade not null,
  curriculum   text not null,
  unit         text,
  assigned_by  uuid references profiles(id) on delete set null,
  assigned_at  timestamptz default now(),
  due_date     date,
  note         text,
  unique(student_id, curriculum, unit)
);

alter table assignments enable row level security;

create policy "Students read own assignments"
  on assignments for select
  using (student_id = auth.uid());

create policy "Admin manage all assignments"
  on assignments for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Kiểm tra
select 'quiz_sessions OK' as status;
select 'assignments OK' as status;
