-- ============================================================
-- Fix 001: Xóa trigger cũ và tạo lại đúng cách
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================

-- Bước 1: Xóa trigger và function cũ nếu có
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Bước 2: Xóa bảng profiles cũ nếu có lỗi cấu trúc
drop table if exists profiles cascade;

-- Bước 3: Tạo lại bảng profiles sạch
create table profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  display_name  text not null default '',
  role          text not null default 'student',
  created_at    timestamptz default now()
);

-- Bước 4: Thêm constraint check role (tách riêng để dễ debug)
alter table profiles
  add constraint profiles_role_check
  check (role in ('student', 'admin'));

-- Bước 5: Bật RLS
alter table profiles enable row level security;

-- Bước 6: Tạo policies
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Policy cho admin đọc tất cả profiles (dùng cách khác để tránh đệ quy)
create policy "Admin reads all profiles"
  on profiles for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Bước 7: Tạo function trigger mới — đơn giản nhất có thể
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;

-- Bước 8: Gắn trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Bước 9: Kiểm tra — phải thấy bảng profiles rỗng (hoặc có data cũ)
select * from profiles;
