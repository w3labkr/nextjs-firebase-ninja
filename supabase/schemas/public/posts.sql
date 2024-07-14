----------------------------------------------------------------
--                                                            --
--                        public.posts                        --
--                                                            --
----------------------------------------------------------------

-- Functions for tracking last modification time
create extension if not exists moddatetime schema extensions;

----------------------------------------------------------------

drop trigger if exists on_created on posts;
drop trigger if exists on_updated_at on posts;
drop trigger if exists on_slug_upsert on posts;

drop function if exists unique_post_slug;
drop function if exists generate_post_slug;
drop function if exists count_posts;
drop function if exists get_adjacent_post_id;
drop function if exists create_new_posts;
drop function if exists handle_new_post;
drop function if exists truncate_posts;
drop function if exists get_posts_by_meta;

drop function if exists title_description;
drop function if exists title_keywords;
drop function if exists title_content;
drop function if exists title_description_keywords;
drop function if exists title_description_content;

drop table if exists posts;

----------------------------------------------------------------

-- Create a table
create table posts (
  id bigint generated by default as identity primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz,
  date timestamptz,
  user_id uuid references users(id) on delete cascade not null,
  type text default 'post'::text not null,
  status text default 'draft'::text not null,
  password varchar(255),
  title text,
  slug text,
  description text,
  keywords text,
  content text,
  thumbnail_url text,
  permalink text,
  is_ban boolean default false not null,
  banned_until timestamptz
);
comment on column posts.updated_at is 'on_updated_at';
comment on column posts.slug is 'on_slug_upsert';
comment on column posts.type is 'post, page, revision';
comment on column posts.status is 'publish, future, draft, pending, private, trash';

-- Add table indexing
create index posts_slug_idx on posts (slug);
create index posts_type_status_date_idx on posts (type, status, date, id);
create index posts_user_id_idx on posts (user_id);
create index posts_user_id_slug_idx on posts (user_id, slug);

-- Secure the table
alter table posts enable row level security;

-- Add row-level security
create policy "Public access for all users" on posts for select to authenticated, anon using ( true );
create policy "User can insert their own posts" on posts for insert to authenticated with check ( (select auth.uid()) = user_id );
create policy "User can update their own posts" on posts for update to authenticated using ( (select auth.uid()) = user_id );
create policy "User can delete their own posts" on posts for delete to authenticated using ( (select auth.uid()) = user_id );

-- Trigger for tracking last modification time
create trigger on_updated_at before update on posts
  for each row execute procedure moddatetime (updated_at);

----------------------------------------------------------------

create or replace function unique_post_slug()
returns trigger
security definer set search_path = public
as $$
declare
  old_slug text;
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
  old_permalink text;
begin
  old_slug := new.slug;
  new_slug := old_slug;
  old_permalink := new.permalink;

  select exists(select 1 from posts where user_id = new.user_id and slug = new_slug and id != coalesce(new.id, 0)) into slug_exists;

  while slug_exists loop
    new_slug := old_slug || '-' || counter;
    counter := counter + 1;
    select exists(select 1 from posts where user_id = new.user_id and slug = new_slug and id != coalesce(new.id, 0)) into slug_exists;
  end loop;

  new.slug := new_slug;
  new.permalink := replace(old_permalink, old_slug, new_slug);
  return new;
end;
$$ language plpgsql;

create trigger on_slug_upsert before insert or update of slug on posts
  for each row execute function unique_post_slug();

----------------------------------------------------------------

create or replace function generate_post_slug(userid uuid, postslug text)
returns text
security definer set search_path = public
as $$
declare
  old_slug text;
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
begin
  old_slug := postslug;
  new_slug := old_slug;

  select exists(select 1 from posts where user_id = userid and slug = new_slug) into slug_exists;

  while slug_exists loop
    new_slug := old_slug || '-' || counter;
    counter := counter + 1;
    select exists(select 1 from posts where user_id = userid and slug = new_slug) into slug_exists;
  end loop;

  return new_slug;
end;
$$ language plpgsql;

----------------------------------------------------------------

create or replace function count_posts(
  userid uuid,
  posttype text = 'post',
  q text = null
)
returns table(status text, count bigint)
security definer set search_path = public
as $$
begin
  if q is not null then
    return query
    select p.status, count(*)
    from posts p where p.user_id = userid and p.type = posttype and to_tsvector(title) @@ to_tsquery(q)
    group by p.status;
  else
    return query
    select p.status, count(*)
    from posts p where p.user_id = userid and p.type = posttype
    group by p.status;
  end if;
end;
$$ language plpgsql;

----------------------------------------------------------------

create or replace function get_adjacent_post_id(
  postid bigint,
  userid uuid,
  posttype text = 'post',
  poststatus text = 'publish'
)
returns table(previous_id bigint, next_id bigint)
security definer set search_path = public
as $$
begin
  return query
  select max(case when id < postid then id end), min(case when id > postid then id end)
  from posts
  where user_id = userid and type = posttype and status = poststatus;
end;
$$ language plpgsql;

----------------------------------------------------------------

create or replace function create_new_posts(data json[])
returns void
security definer set search_path = public
as $$
declare
  r json;
  postid bigint;
begin
  foreach r in array data loop
    insert into posts
    (created_at,updated_at,deleted_at,date,user_id,type,status,password,title,slug,description,keywords,content,thumbnail_url,permalink,is_ban,banned_until)
    values
    (
      coalesce((r ->> 'created_at')::timestamptz, now()),
      coalesce((r ->> 'updated_at')::timestamptz, now()),
      (r ->> 'deleted_at')::timestamptz,
      (r ->> 'date')::timestamptz,
      (r ->> 'user_id')::uuid,
      coalesce((r ->> 'type')::text, 'post'),
      coalesce((r ->> 'status')::text, 'draft'),
      (r ->> 'password')::varchar(255),
      (r ->> 'title')::text,
      (r ->> 'slug')::text,
      (r ->> 'description')::text,
      (r ->> 'keywords')::text,
      (r ->> 'content')::text,
      (r ->> 'thumbnail_url')::text,
      (r ->> 'permalink')::text,
      coalesce((r ->> 'is_ban')::boolean, false),
      (r ->> 'banned_until')::timestamptz
    );
  end loop;
end;
$$ language plpgsql;

----------------------------------------------------------------

create or replace function handle_new_post()
returns trigger
security definer set search_path = public
as $$
begin
  insert into postmeta (post_id, meta_key, meta_value) values (new.id, 'views', '0');
  return new;
end;
$$ language plpgsql;

create trigger on_created after insert on posts
  for each row execute procedure handle_new_post();

----------------------------------------------------------------

create or replace function truncate_posts()
returns void
security definer set search_path = public
as $$
begin
  truncate table posts restart identity cascade;
end;
$$ language plpgsql;

----------------------------------------------------------------

create or replace function get_posts_by_meta(
  metakey text,
  datatype text = 'text',
  ascending boolean = null
)
returns setof posts
security definer set search_path = public
as $$
begin
  if ascending is not null and datatype = 'integer' then
    return query
    select p.* from posts p join postmeta m on p.id = m.post_id where m.meta_key = metakey
    order by
      case ascending when true then m.meta_value::integer else 0 end asc,
      case ascending when false then m.meta_value::integer else 0 end desc;
  elsif ascending is not null then
    return query
    select p.* from posts p join postmeta m on p.id = m.post_id where m.meta_key = metakey
    order by
      case ascending when true then m.meta_value else 0 end asc,
      case ascending when false then m.meta_value else 0 end desc;
  else
    return query
    select p.* from posts p join postmeta m on p.id = m.post_id where m.meta_key = metakey;
  end if;
end;
$$ language plpgsql;

----------------------------------------------------------------

-- Search multiple columns
-- https://supabase.com/docs/guides/database/full-text-search?queryGroups=example-view&example-view=sql&queryGroups=language&language=js#search-multiple-columns

create function title_description(posts) returns text as $$
  select $1.title || ' ' || $1.description;
$$ language sql immutable;

create function title_keywords(posts) returns text as $$
  select $1.title || ' ' || $1.keywords;
$$ language sql immutable;

create function title_content(posts) returns text as $$
  select $1.title || ' ' || $1.content;
$$ language sql immutable;

create function title_description_keywords(posts) returns text as $$
  select $1.title || ' ' || $1.description || ' ' || $1.keywords;
$$ language sql immutable;

create function title_description_content(posts) returns text as $$
  select $1.title || ' ' || $1.description || ' ' || $1.content;
$$ language sql immutable;
