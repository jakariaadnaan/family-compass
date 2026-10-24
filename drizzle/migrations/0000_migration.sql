
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  platform text not null default 'android',
  status text not null default 'pending',
  last_seen_at timestamptz,
  location_consent boolean not null default false,
  usage_consent boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.devices to authenticated;
grant all on public.devices to service_role;
alter table public.devices enable row level security;
create policy "own devices select" on public.devices for select to authenticated using (owner_id = auth.uid());
create policy "own devices update" on public.devices for update to authenticated using (owner_id = auth.uid());
create policy "own devices delete" on public.devices for delete to authenticated using (owner_id = auth.uid());
create index devices_owner_idx on public.devices(owner_id);

create table public.device_pairing_codes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  device_name text not null,
  code_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, delete on public.device_pairing_codes to authenticated;
grant all on public.device_pairing_codes to service_role;
alter table public.device_pairing_codes enable row level security;
create policy "own codes select" on public.device_pairing_codes for select to authenticated using (owner_id = auth.uid());
create policy "own codes delete" on public.device_pairing_codes for delete to authenticated using (owner_id = auth.uid());

create table public.location_records (
  id bigserial primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  accuracy_m real,
  recorded_at timestamptz not null default now()
);
grant select, delete on public.location_records to authenticated;
grant all on public.location_records to service_role;
alter table public.location_records enable row level security;
create policy "own loc select" on public.location_records for select to authenticated using (exists (select 1 from public.devices d where d.id = device_id and d.owner_id = auth.uid()));
create policy "own loc delete" on public.location_records for delete to authenticated using (exists (select 1 from public.devices d where d.id = device_id and d.owner_id = auth.uid()));
create index loc_device_time_idx on public.location_records(device_id, recorded_at desc);

create table public.usage_summaries (
  id bigserial primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  day date not null,
  package_name text not null,
  app_label text,
  foreground_minutes integer not null default 0,
  unique (device_id, day, package_name)
);
grant select, delete on public.usage_summaries to authenticated;
grant all on public.usage_summaries to service_role;
alter table public.usage_summaries enable row level security;
create policy "own usage select" on public.usage_summaries for select to authenticated using (exists (select 1 from public.devices d where d.id = device_id and d.owner_id = auth.uid()));
create policy "own usage delete" on public.usage_summaries for delete to authenticated using (exists (select 1 from public.devices d where d.id = device_id and d.owner_id = auth.uid()));

create table public.audit_logs (
  id bigserial primary key,
  user_id uuid not null,
  action text not null,
  target text,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "own audit select" on public.audit_logs for select to authenticated using (user_id = auth.uid());
create index audit_user_time_idx on public.audit_logs(user_id, created_at desc);

-- audit trigger for device changes
create or replace function public.audit_device_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    insert into audit_logs(user_id, action, target) values (old.owner_id, 'device.removed', old.name);
    return old;
  elsif tg_op = 'UPDATE' then
    insert into audit_logs(user_id, action, target) values (new.owner_id, 'device.updated', new.name);
    return new;
  end if;
  return new;
end $$;
create trigger devices_audit after update or delete on public.devices for each row execute function public.audit_device_change();

-- create pairing code (returns plaintext once, stores hash)
create extension if not exists pgcrypto with schema extensions;
create or replace function public.create_pairing_code(_device_name text)
returns table(code text, expires_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
declare
  _uid uuid := auth.uid();
  _code text;
  _exp timestamptz := now() + interval '10 minutes';
  _alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i int;
begin
  if _uid is null then raise exception 'not authenticated'; end if;
  if length(trim(coalesce(_device_name,''))) < 1 or length(_device_name) > 60 then
    raise exception 'invalid device name';
  end if;
  if (select count(*) from device_pairing_codes where owner_id = _uid and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too many pairing codes, try later';
  end if;
  _code := '';
  for i in 1..8 loop
    _code := _code || substr(_alphabet, 1 + (get_byte(gen_random_bytes(1),0) % length(_alphabet)), 1);
  end loop;
  insert into device_pairing_codes(owner_id, device_name, code_hash, expires_at)
    values (_uid, trim(_device_name), encode(digest(_code, 'sha256'), 'hex'), _exp);
  insert into audit_logs(user_id, action, target) values (_uid, 'pairing_code.created', trim(_device_name));
  return query select _code, _exp;
end $$;
revoke all on function public.create_pairing_code(text) from public, anon;
grant execute on function public.create_pairing_code(text) to authenticated;
