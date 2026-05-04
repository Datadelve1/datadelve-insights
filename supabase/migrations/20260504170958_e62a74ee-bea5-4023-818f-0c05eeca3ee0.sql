
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-datasets', 'project-datasets', true, 524288000)
on conflict (id) do update set public = true, file_size_limit = 524288000;

create policy "Public read project-datasets"
on storage.objects for select
using (bucket_id = 'project-datasets');
