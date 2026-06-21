create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  avatar_color text default '#6366F1',
  created_at timestamp with time zone default now()
);

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid default auth.uid() references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#6366F1',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  position integer not null default 0,
  assignee_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  author_name text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table if not exists subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  title text not null,
  is_complete boolean default false,
  position integer not null default 0
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
before update on projects
for each row execute function set_updated_at();

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at
before update on tasks
for each row execute function set_updated_at();

create or replace function create_profile_for_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'TaskFlow User'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists auth_create_profile on auth.users;
create trigger auth_create_profile
after insert on auth.users
for each row execute function create_profile_for_new_user();

create or replace function create_project(
  project_name text,
  project_description text default null,
  project_color text default '#6366F1'
)
returns projects
language plpgsql
security definer
set search_path = public
as $$
declare
  new_project projects;
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'You must be logged in to create a project.';
  end if;

  insert into projects (owner_id, name, description, color)
  values (current_user_id, project_name, nullif(project_description, ''), coalesce(project_color, '#6366F1'))
  returning * into new_project;

  return new_project;
end;
$$;

grant execute on function create_project(text, text, text) to authenticated;

alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table task_comments enable row level security;
alter table subtasks enable row level security;

alter table projects alter column owner_id set default auth.uid();

create policy "Users can read own profile" on profiles
for select using (id = auth.uid());

create policy "Users can insert own profile" on profiles
for insert with check (id = auth.uid());

create policy "Users can update own profile" on profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Users can delete own profile" on profiles
for delete using (id = auth.uid());

create policy "Users can read own projects" on projects
for select using (owner_id = auth.uid());

create policy "Users can create own projects" on projects
for insert with check (owner_id = auth.uid());

create policy "Users can update own projects" on projects
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users can delete own projects" on projects
for delete using (owner_id = auth.uid());

create policy "Users can read project tasks" on tasks
for select using (
  exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can create project tasks" on tasks
for insert with check (
  exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can update project tasks" on tasks
for update using (
  exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can delete project tasks" on tasks
for delete using (
  exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can read task comments" on task_comments
for select using (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = task_comments.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can create task comments" on task_comments
for insert with check (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = task_comments.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can update task comments" on task_comments
for update using (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = task_comments.task_id
    and projects.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = task_comments.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can delete task comments" on task_comments
for delete using (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = task_comments.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can read subtasks" on subtasks
for select using (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = subtasks.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can create subtasks" on subtasks
for insert with check (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = subtasks.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can update subtasks" on subtasks
for update using (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = subtasks.task_id
    and projects.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = subtasks.task_id
    and projects.owner_id = auth.uid()
  )
);

create policy "Users can delete subtasks" on subtasks
for delete using (
  exists (
    select 1 from tasks
    join projects on projects.id = tasks.project_id
    where tasks.id = subtasks.task_id
    and projects.owner_id = auth.uid()
  )
);
