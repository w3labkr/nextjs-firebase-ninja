----------------------------------------------------------------
--                                                            --
--                    public.notifications                    --
--                                                            --
----------------------------------------------------------------

drop trigger if exists on_updated_at on notifications;

drop table if exists notifications;

----------------------------------------------------------------

create table notifications (
  id bigint generated by default as identity primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  user_id uuid references users(id) on delete cascade not null,
  marketing_emails boolean default false not null,
  security_emails boolean default true not null
);

-- Secure the table
alter table notifications enable row level security;

-- Add row-level security
create policy "User can select their own notifications" on notifications for select to authenticated using ( (select auth.uid()) = user_id );
create policy "User can insert their own notifications" on notifications for insert to authenticated with check ( (select auth.uid()) = user_id );
create policy "User can update their own notifications" on notifications for update to authenticated using ( (select auth.uid()) = user_id );
create policy "User can delete their own notifications" on notifications for delete to authenticated using ( (select auth.uid()) = user_id );

-- Functions for tracking last modification time
create extension if not exists moddatetime schema extensions;
create trigger on_updated_at before update on notifications
  for each row execute procedure moddatetime (updated_at);
