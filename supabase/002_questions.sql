-- ============================================================
-- Migration 002: questions table
-- Chạy trong Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tạo bảng questions
create table if not exists questions (
  id           bigserial primary key,
  curriculum   text not null,
  unit         text not null,
  type         text not null
               check (type in ('multiple_choice','fill_in_blank','reorder','error_correction','matching')),
  question     text not null,
  payload      jsonb not null default '{}',
  correct      jsonb not null,
  explanation  text not null default '',
  difficulty   text not null default 'medium'
               check (difficulty in ('easy','medium','hard')),
  is_active    boolean not null default true,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz default now()
);

-- 2. Indexes để filter nhanh
create index if not exists idx_questions_curriculum on questions(curriculum);
create index if not exists idx_questions_unit       on questions(curriculum, unit);
create index if not exists idx_questions_active     on questions(is_active);
create index if not exists idx_questions_type       on questions(type);

-- 3. RLS
alter table questions enable row level security;

-- Mọi người đọc được câu hỏi active (kể cả guest qua anon key)
create policy "Anyone can read active questions"
  on questions for select
  using (is_active = true);

-- Chỉ admin mới insert/update/delete
create policy "Admin can insert questions"
  on questions for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can update questions"
  on questions for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can delete questions"
  on questions for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Kiểm tra
select count(*) from questions;
