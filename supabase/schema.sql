-- ============================================================
-- MVP Gestión Doméstica — Schema + RLS
-- Ejecutar en el SQL editor de Supabase (o vía supabase db push)
-- ============================================================

-- Extensión para uuids
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------

create table casas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  creada_por  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table miembros_casa (
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  casa_id     uuid not null references casas (id) on delete cascade,
  rol         text not null default 'miembro' check (rol in ('admin', 'miembro')),
  created_at  timestamptz not null default now(),
  primary key (usuario_id, casa_id)
);

-- Tabla de referencia estática: días estimados de vida por producto
-- (se usa para autocompletar dias_estimados en items_refri)
create table referencia_caducidad (
  nombre         text primary key,
  categoria      text not null check (categoria in ('fruta', 'verdura')),
  dias_estimados int not null
);

create table items_refri (
  id              uuid primary key default gen_random_uuid(),
  casa_id         uuid not null references casas (id) on delete cascade,
  nombre          text not null,
  categoria       text not null check (
                    categoria in ('fruta', 'verdura', 'lacteo', 'carne', 'preparado', 'otro')
                  ),
  tipo_tracking   text not null check (tipo_tracking in ('dias', 'fecha')),
  fecha_entrada   date not null default current_date,
  fecha_caducidad date,
  dias_estimados  int,
  creado_por      uuid not null references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  -- si el tracking es por días, dias_estimados es obligatorio;
  -- si es por fecha, fecha_caducidad es obligatoria
  constraint tracking_coherente check (
    (tipo_tracking = 'dias' and dias_estimados is not null)
    or
    (tipo_tracking = 'fecha' and fecha_caducidad is not null)
  )
);

create table tareas (
  id                uuid primary key default gen_random_uuid(),
  casa_id           uuid not null references casas (id) on delete cascade,
  nombre            text not null,
  frecuencia_dias   int not null check (frecuencia_dias > 0),
  asignado_a        uuid references auth.users (id) on delete set null,
  ultima_ejecucion  date,
  creado_por        uuid not null references auth.users (id) on delete cascade,
  created_at        timestamptz not null default now()
);

-- Índices para las queries más comunes
create index idx_miembros_casa_usuario on miembros_casa (usuario_id);
create index idx_items_refri_casa on items_refri (casa_id);
create index idx_tareas_casa on tareas (casa_id);

-- ------------------------------------------------------------
-- Helper: pertenencia a una casa
-- security definer para evitar recursión infinita cuando
-- miembros_casa necesita comprobarse a sí misma en su propia policy
-- ------------------------------------------------------------

create or replace function is_member_of_casa(target_casa_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from miembros_casa
    where casa_id = target_casa_id
      and usuario_id = auth.uid()
  );
$$;

create or replace function is_admin_of_casa(target_casa_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from miembros_casa
    where casa_id = target_casa_id
      and usuario_id = auth.uid()
      and rol = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- Trigger: al crear una casa, el creador entra automáticamente
-- como admin en miembros_casa (evita el problema de "huevo y gallina"
-- con RLS al hacer el insert manual desde el cliente)
-- ------------------------------------------------------------

create or replace function handle_nueva_casa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into miembros_casa (usuario_id, casa_id, rol)
  values (new.creada_por, new.id, 'admin');
  return new;
end;
$$;

create trigger trg_nueva_casa
  after insert on casas
  for each row
  execute function handle_nueva_casa();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table casas enable row level security;
alter table miembros_casa enable row level security;
alter table items_refri enable row level security;
alter table tareas enable row level security;
alter table referencia_caducidad enable row level security;

-- casas: solo ves/editas casas a las que perteneces
create policy "casas_select_miembros"
  on casas for select
  using (is_member_of_casa(id));

create policy "casas_insert_autenticado"
  on casas for insert
  with check (auth.uid() = creada_por);

create policy "casas_update_admin"
  on casas for update
  using (is_admin_of_casa(id));

create policy "casas_delete_admin"
  on casas for delete
  using (is_admin_of_casa(id));

-- miembros_casa: ves tu propia fila o las de una casa donde ya eres miembro
create policy "miembros_select_mismos_miembros"
  on miembros_casa for select
  using (
    usuario_id = auth.uid()
    or is_member_of_casa(casa_id)
  );

-- el insert normal lo hace el trigger (security definer);
-- esta policy cubre el caso de que un admin invite a otro miembro
create policy "miembros_insert_admin"
  on miembros_casa for insert
  with check (is_admin_of_casa(casa_id));

create policy "miembros_update_admin"
  on miembros_casa for update
  using (is_admin_of_casa(casa_id));

create policy "miembros_delete_admin_o_propio"
  on miembros_casa for delete
  using (is_admin_of_casa(casa_id) or usuario_id = auth.uid());

-- items_refri: CRUD completo para cualquier miembro de la casa
create policy "items_refri_select"
  on items_refri for select
  using (is_member_of_casa(casa_id));

create policy "items_refri_insert"
  on items_refri for insert
  with check (is_member_of_casa(casa_id) and auth.uid() = creado_por);

create policy "items_refri_update"
  on items_refri for update
  using (is_member_of_casa(casa_id));

create policy "items_refri_delete"
  on items_refri for delete
  using (is_member_of_casa(casa_id));

-- tareas: CRUD completo para cualquier miembro de la casa
create policy "tareas_select"
  on tareas for select
  using (is_member_of_casa(casa_id));

create policy "tareas_insert"
  on tareas for insert
  with check (is_member_of_casa(casa_id) and auth.uid() = creado_por);

create policy "tareas_update"
  on tareas for update
  using (is_member_of_casa(casa_id));

create policy "tareas_delete"
  on tareas for delete
  using (is_member_of_casa(casa_id));

-- referencia_caducidad: catálogo público de solo lectura para cualquier
-- usuario autenticado (no depende de ninguna casa)
create policy "referencia_select_autenticados"
  on referencia_caducidad for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- Seed: tabla de referencia de días estimados (frutas/verduras comunes)
-- ------------------------------------------------------------

insert into referencia_caducidad (nombre, categoria, dias_estimados) values
  ('platano',    'fruta',   5),
  ('manzana',    'fruta',   21),
  ('pera',       'fruta',   14),
  ('naranja',    'fruta',   21),
  ('limon',      'fruta',   28),
  ('uva',        'fruta',   7),
  ('fresa',      'fruta',   4),
  ('mango',      'fruta',   6),
  ('aguacate',   'fruta',   5),
  ('piña',       'fruta',   5),
  ('sandia',     'fruta',   7),
  ('papaya',     'fruta',   4),
  ('tomate',     'verdura', 7),
  ('lechuga',    'verdura', 7),
  ('zanahoria',  'verdura', 21),
  ('cebolla',    'verdura', 30),
  ('papa',       'verdura', 30),
  ('pepino',     'verdura', 7),
  ('brocoli',    'verdura', 7),
  ('espinaca',   'verdura', 5),
  ('pimiento',   'verdura', 14),
  ('calabacita', 'verdura', 7),
  ('apio',       'verdura', 14),
  ('champiñon',  'verdura', 5)
on conflict (nombre) do nothing;

-- ============================================================
-- Migraciones posteriores (aplicadas vía SQL editor, agregadas
-- aquí para que este archivo siga siendo la fuente de verdad)
-- ============================================================

-- Paso 5: mostrar el email de los miembros de una casa para el
-- selector de "asignar a" en tareas. auth.users no es legible
-- directo por el cliente, por eso se expone solo lo necesario y
-- solo para quien ya es miembro de esa misma casa.
create or replace function miembros_casa_con_email(p_casa_id uuid)
returns table (usuario_id uuid, email text, rol text)
language sql
security definer
set search_path = public
stable
as $$
  select m.usuario_id, u.email, m.rol
  from miembros_casa m
  join auth.users u on u.id = m.usuario_id
  where m.casa_id = p_casa_id
    and is_member_of_casa(p_casa_id);
$$;

grant execute on function miembros_casa_con_email(uuid) to authenticated;

-- Invitar miembros: cada casa tiene un código de invitación
-- regenerable (por un admin) con expiración. Compartible como link
-- (`/casas/unirse?codigo=...`) o dictado en persona.
alter table casas add column if not exists codigo_invitacion text unique;
alter table casas add column if not exists codigo_invitacion_expira timestamptz;

-- Previsualiza una invitación (nombre de la casa) sin unirse todavía.
-- security definer porque quien la llama aún NO es miembro, así que
-- normalmente no tendría permiso de leer la fila de `casas`.
create or replace function previsualizar_invitacion(p_codigo text)
returns table (casa_id uuid, nombre text)
language sql
security definer
set search_path = public
stable
as $$
  select id, nombre
  from casas
  where codigo_invitacion = p_codigo
    and codigo_invitacion_expira > now();
$$;

grant execute on function previsualizar_invitacion(text) to authenticated;

-- Confirma la unión: valida el código y agrega al usuario actual como
-- miembro. `on conflict do nothing` hace que reusar el mismo link no
-- truene si ya eras miembro.
create or replace function unirse_a_casa(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_casa_id uuid;
begin
  select id into v_casa_id
  from casas
  where codigo_invitacion = p_codigo
    and codigo_invitacion_expira > now();

  if v_casa_id is null then
    raise exception 'Código de invitación inválido o expirado';
  end if;

  insert into miembros_casa (usuario_id, casa_id, rol)
  values (auth.uid(), v_casa_id, 'miembro')
  on conflict (usuario_id, casa_id) do nothing;

  return v_casa_id;
end;
$$;

grant execute on function unirse_a_casa(text) to authenticated;

-- Perfil de usuario: nombre/apellido. auth.users NO guarda estos campos,
-- así que viven en su propia tabla, 1:1 con auth.users vía el mismo id.
-- Nullable porque se llenan automáticamente vía trigger (ver más abajo)
-- a partir de los metadatos del signup o de Google — sin bloquear el
-- acceso si por alguna razón vinieran vacíos.
create table perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text,
  apellido   text,
  created_at timestamptz not null default now()
);

alter table perfiles enable row level security;

-- Ves tu propio perfil, y el de cualquiera con quien compartas una casa
-- (útil para mostrar nombres reales en vez de emails en tareas/refri).
create policy "perfiles_select_propio_o_compartido"
  on perfiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from miembros_casa m1
      join miembros_casa m2 on m1.casa_id = m2.casa_id
      where m1.usuario_id = auth.uid() and m2.usuario_id = perfiles.id
    )
  );

create policy "perfiles_update_propio"
  on perfiles for update
  using (id = auth.uid());

-- Al crear un usuario (email/password o Google, da igual), copia
-- nombre/apellido a `perfiles` automáticamente. Para signup por
-- email, nombre/apellido llegan en options.data del signUp() del
-- cliente (quedan en raw_user_meta_data). Para Google, Supabase ya
-- puebla given_name/family_name ahí solo. security definer porque en
-- este punto todavía no hay sesión (auth.uid() sería null).
create or replace function handle_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfiles (id, nombre, apellido)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'given_name'),
    coalesce(new.raw_user_meta_data ->> 'apellido', new.raw_user_meta_data ->> 'family_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_nuevo_usuario
  after insert on auth.users
  for each row
  execute function handle_nuevo_usuario();

-- Reemplaza a miembros_casa_con_email: ahora también trae nombre/apellido
-- (pueden venir null si ese miembro aún no completó su perfil).
drop function if exists miembros_casa_con_email(uuid);

create or replace function miembros_casa_con_perfil(p_casa_id uuid)
returns table (usuario_id uuid, email text, rol text, nombre text, apellido text)
language sql
security definer
set search_path = public
stable
as $$
  select m.usuario_id, u.email, m.rol, p.nombre, p.apellido
  from miembros_casa m
  join auth.users u on u.id = m.usuario_id
  left join perfiles p on p.id = m.usuario_id
  where m.casa_id = p_casa_id
    and is_member_of_casa(p_casa_id);
$$;

grant execute on function miembros_casa_con_perfil(uuid) to authenticated;
