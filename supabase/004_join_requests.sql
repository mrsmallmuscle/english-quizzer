-- ============================================================
-- Migration 004: join_requests
-- ============================================================

create table if not exists join_requests (
  id          bigserial primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  message     text,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz default now(),
  unique(user_id)   -- mỗi user chỉ có 1 request pending
);

alter table join_requests enable row level security;

-- Student xem và tạo request của mình
create policy "Student manage own request"
  on join_requests for all
  using (user_id = auth.uid());

-- Admin xem và xử lý tất cả
create policy "Admin manage all requests"
  on join_requests for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

select 'join_requests OK' as status;
