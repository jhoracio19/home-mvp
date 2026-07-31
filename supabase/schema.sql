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
