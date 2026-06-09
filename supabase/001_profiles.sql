-- ============================================================
-- Migration 001: profiles table + trigger
-- Chạy file này trong Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Bảng profiles (mở rộng auth.users)
create table if not exists profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  display_name  text not null default '',
  role          text not null default 'student'
                check (role in ('student', 'admin')),
  created_at    timestamptz default now()
);

-- 2. RLS
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Trigger: tự động tạo profile khi user đăng ký
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 4. Thăng cấp admin thủ công (chạy sau khi bạn đã đăng ký tài khoản)
-- Thay YOUR_EMAIL bằng email admin của bạn:
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR_EMAIL');
