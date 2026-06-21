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

drop policy if exists "Users can create own projects" on projects;

create policy "Users can create own projects" on projects
for insert
to authenticated
with check (owner_id = auth.uid());
