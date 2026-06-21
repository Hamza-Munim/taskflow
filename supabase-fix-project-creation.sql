alter table projects alter column owner_id set default auth.uid();

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

create or replace function list_projects()
returns table (
  id uuid,
  owner_id uuid,
  name text,
  description text,
  color text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  task_count bigint,
  done_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.owner_id,
    p.name,
    p.description,
    p.color,
    p.created_at,
    p.updated_at,
    count(t.id) as task_count,
    count(t.id) filter (where t.status = 'done') as done_count
  from projects p
  left join tasks t on t.project_id = p.id
  where p.owner_id = auth.uid()
  group by p.id
  order by p.updated_at desc;
$$;

grant execute on function list_projects() to authenticated;

create or replace function get_project(p_project_id uuid)
returns table (
  id uuid,
  owner_id uuid,
  name text,
  description text,
  color text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.owner_id,
    p.name,
    p.description,
    p.color,
    p.created_at,
    p.updated_at
  from projects p
  where p.id = p_project_id
  and p.owner_id = auth.uid()
  limit 1;
$$;

grant execute on function get_project(uuid) to authenticated;

drop policy if exists "Users can create own projects" on projects;

create policy "Users can create own projects" on projects
for insert
to authenticated
with check (owner_id = auth.uid());
