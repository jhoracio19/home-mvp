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

-- Necesaria para el upsert en /perfil (editar perfil): cubre tanto
-- actualizar como el caso de cuentas viejas que nunca tuvieron fila
-- porque se crearon antes de que existiera el trigger de abajo.
create policy "perfiles_insert_propio"
  on perfiles for insert
  with check (id = auth.uid());

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

-- Tareas: además de "cada N días", ahora se puede repetir en días fijos
-- de la semana (ej. lavar trastes lunes/miércoles/jueves). Un solo tipo
-- de frecuencia activo a la vez; frecuencia_dias deja de ser obligatoria.
alter table tareas add column if not exists tipo_frecuencia text not null default 'intervalo'
  check (tipo_frecuencia in ('intervalo', 'dias_semana'));

alter table tareas alter column frecuencia_dias drop not null;
alter table tareas drop constraint if exists tareas_frecuencia_dias_check;
alter table tareas add column if not exists dias_semana int[];

-- 0 = domingo ... 6 = sábado (mismo criterio que Date.getDay() en JS).
alter table tareas add constraint tareas_frecuencia_coherente check (
  (tipo_frecuencia = 'intervalo' and frecuencia_dias is not null and frecuencia_dias > 0)
  or
  (
    tipo_frecuencia = 'dias_semana'
    and dias_semana is not null
    and array_length(dias_semana, 1) > 0
    and dias_semana <@ array[0, 1, 2, 3, 4, 5, 6]
  )
);

-- Notificaciones push (Web Push). Cada suscripción es un dispositivo/
-- navegador donde el usuario aceptó recibir notificaciones; puede tener
-- varias (ej. celular + laptop). El endpoint lo genera el navegador y
-- ya es único de por sí, por eso sirve como llave natural para upsert
-- al volver a suscribirse.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy push_subscriptions_select_propio on push_subscriptions
  for select using (usuario_id = auth.uid());

create policy push_subscriptions_insert_propio on push_subscriptions
  for insert with check (usuario_id = auth.uid());

create policy push_subscriptions_delete_propio on push_subscriptions
  for delete using (usuario_id = auth.uid());

-- El cron que manda las notificaciones corre con la service role key
-- (bypassa RLS a propósito: necesita leer suscripciones de todos los
-- usuarios, no solo las de quien hace la petición).

-- Historial de tareas completadas. `nombre_tarea` y `nombre_usuario` son
-- una copia (no una referencia) de cómo se llamaban la tarea y quién la
-- hizo en ese momento — así el historial se queda igual aunque después
-- se renombre la tarea, se borre, o esa persona salga de la casa (lo
-- cual además evita depender de la RLS de `perfiles`, que solo deja ver
-- perfiles de miembros ACTUALES de una casa compartida).
create table if not exists historial_tareas (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references casas(id) on delete cascade,
  tarea_id uuid references tareas(id) on delete set null,
  nombre_tarea text not null,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nombre_usuario text not null,
  completada_en timestamptz not null default now()
);

create index if not exists idx_historial_tareas_casa on historial_tareas (casa_id, completada_en desc);

alter table historial_tareas enable row level security;

create policy historial_tareas_select on historial_tareas
  for select using (is_member_of_casa(casa_id));

create policy historial_tareas_insert on historial_tareas
  for insert with check (is_member_of_casa(casa_id) and auth.uid() = usuario_id);

-- ------------------------------------------------------------
-- Revisión de seguridad (endpoints + RLS)
-- ------------------------------------------------------------

-- push_subscriptions no tenía policy de UPDATE. Sin ella, RLS bloquea
-- por completo la rama "ON CONFLICT DO UPDATE" del upsert que usa
-- guardarSuscripcion() al reactivar notificaciones en un dispositivo
-- que ya tenía una suscripción guardada (mismo endpoint) — se veía
-- como que "no pasaba nada" al reactivar. De paso, esta policy deja
-- explícito lo que antes solo pasaba por accidente (RLS ya bloqueaba
-- de facto que alguien "robara" el endpoint push de otro usuario vía
-- upsert, por falta total de policy UPDATE): ahora solo se puede
-- actualizar una fila si YA era tuya y SIGUE siendo tuya.
create policy push_subscriptions_update_propio on push_subscriptions
  for update using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Límites de longitud como defensa en profundidad: la app ya valida
-- esto en los server actions, pero cualquiera con un JWT válido puede
-- llamar a la API REST de Supabase directo, sin pasar por el server
-- action ni por la UI. Los límites viven en la base para que apliquen
-- sin importar por dónde entre la escritura.
alter table casas add constraint casas_nombre_longitud check (char_length(nombre) <= 80);
alter table tareas add constraint tareas_nombre_longitud check (char_length(nombre) <= 100);
alter table items_refri add constraint items_refri_nombre_longitud check (char_length(nombre) <= 100);
alter table perfiles add constraint perfiles_nombre_longitud check (nombre is null or char_length(nombre) <= 60);
alter table perfiles add constraint perfiles_apellido_longitud check (apellido is null or char_length(apellido) <= 60);

-- ------------------------------------------------------------
-- Lista de compras compartida
-- ------------------------------------------------------------

-- `comprado` se queda marcado (no se borra solo al tacharlo) para que
-- la lista se comporte como una lista física: vas tachando conforme
-- compras, y "Limpiar comprados" la deja lista para el siguiente viaje
-- al súper. Sin RETURNING problemático aquí (a diferencia de casas):
-- no hay trigger que dependa de leer la fila recién insertada.
create table if not exists lista_compras (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references casas(id) on delete cascade,
  nombre text not null,
  agregado_por uuid not null references auth.users(id) on delete cascade,
  comprado boolean not null default false,
  comprado_por uuid references auth.users(id) on delete set null,
  comprado_en timestamptz,
  created_at timestamptz not null default now(),
  constraint lista_compras_nombre_longitud check (char_length(nombre) <= 100)
);

create index if not exists idx_lista_compras_casa on lista_compras (casa_id, comprado, created_at);

alter table lista_compras enable row level security;

create policy lista_compras_select on lista_compras
  for select using (is_member_of_casa(casa_id));

create policy lista_compras_insert on lista_compras
  for insert with check (is_member_of_casa(casa_id) and auth.uid() = agregado_por);

-- "update" cubre tanto marcar/desmarcar comprado como cualquier otro
-- miembro tachándolo (no solo quien lo agregó) — así funciona una
-- lista compartida de verdad.
create policy lista_compras_update on lista_compras
  for update using (is_member_of_casa(casa_id));

create policy lista_compras_delete on lista_compras
  for delete using (is_member_of_casa(casa_id));

-- ------------------------------------------------------------
-- Notas de la casa
-- ------------------------------------------------------------

-- Una sola nota compartida por casa (no una lista de varias) — como
-- una hoja pegada en el refri: wifi, reglas, contactos, lo que sea,
-- todo junto, cualquier miembro la puede editar. `casa_id` como llave
-- primaria fuerza el 1:1. Se crea con upsert desde la app (no hace
-- falta un trigger como el de miembros_casa: si la fila no existe
-- todavía, el primer guardado la crea).
create table if not exists notas_casa (
  casa_id uuid primary key references casas(id) on delete cascade,
  contenido text not null default '',
  actualizado_por uuid references auth.users(id) on delete set null,
  actualizado_en timestamptz not null default now(),
  constraint notas_casa_contenido_longitud check (char_length(contenido) <= 5000)
);

alter table notas_casa enable row level security;

create policy notas_casa_select on notas_casa
  for select using (is_member_of_casa(casa_id));

create policy notas_casa_insert on notas_casa
  for insert with check (is_member_of_casa(casa_id));

create policy notas_casa_update on notas_casa
  for update using (is_member_of_casa(casa_id));

-- Cantidad opcional en la lista de compras (ej. "2 litros", "1 paquete").
alter table lista_compras add column if not exists cantidad text;
alter table lista_compras add constraint lista_compras_cantidad_longitud
  check (cantidad is null or char_length(cantidad) <= 30);

-- ------------------------------------------------------------
-- Tiempo real
-- ------------------------------------------------------------

-- Habilita Supabase Realtime (postgres_changes) para las tablas que se
-- comparten en vivo entre miembros de una misma casa. Es un comando de
-- una sola vez: si lo vuelves a correr con la tabla ya agregada, da
-- error de "ya existe" — no pasa nada, esa parte ya quedó.
alter publication supabase_realtime add table items_refri;
alter publication supabase_realtime add table tareas;
alter publication supabase_realtime add table lista_compras;
alter publication supabase_realtime add table notas_casa;

-- ------------------------------------------------------------
-- Gastos compartidos
-- ------------------------------------------------------------

-- MVP simple a propósito: cada gasto se divide en partes iguales entre
-- los miembros ACTUALES de la casa (calculado al vuelo en la app, no
-- guardado por gasto) — no hay selección de participantes por gasto.
-- Si alguien entra o sale de la casa, los repartos de gastos viejos
-- se recalculan con la membresía de hoy; para el tamaño de casa que
-- maneja esta app (pocas personas, poco movimiento) es una
-- simplificación razonable frente a la complejidad de "quién
-- participaba en cada gasto en su momento".
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references casas(id) on delete cascade,
  descripcion text not null,
  monto numeric(10, 2) not null check (monto > 0 and monto <= 999999.99),
  pagado_por uuid not null references auth.users(id) on delete cascade,
  fecha date not null default current_date,
  creado_por uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint gastos_descripcion_longitud check (char_length(descripcion) <= 100)
);

create index if not exists idx_gastos_casa on gastos (casa_id, fecha desc);

alter table gastos enable row level security;

create policy gastos_select on gastos
  for select using (is_member_of_casa(casa_id));

create policy gastos_insert on gastos
  for insert with check (is_member_of_casa(casa_id) and auth.uid() = creado_por);

create policy gastos_delete on gastos
  for delete using (is_member_of_casa(casa_id));

alter publication supabase_realtime add table gastos;
