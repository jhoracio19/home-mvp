import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

// Umbral para considerar que un usuario "nunca volvió a entrar": GoTrue
// pone last_sign_in_at = created_at en el signup mismo, así que un
// usuario que solo entró una vez tiene ambos valores casi idénticos
// (no exactamente iguales por precisión de reloj/redondeo).
const UMBRAL_MISMO_LOGIN_MS = 10_000;

type EventoActividad = {
  tipo: 'tarea_completada' | 'tarea_creada' | 'item_refri' | 'compra' | 'gasto' | 'pago' | 'nota';
  descripcion: string;
  usuarioId: string;
  casaId: string;
  fecha: string;
};

async function obtenerTodosLosUsuarios(supabase: ReturnType<typeof createAdminClient>) {
  const usuarios: User[] = [];
  let page = 1;
  const perPage = 200;

  // Bucle de paginación por si en el futuro hay más de una página;
  // hoy con ~30 usuarios entra completo en la primera vuelta.
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    usuarios.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  return usuarios;
}

export const getEstadisticasAdmin = cache(async () => {
  const supabase = createAdminClient();

  const [
    usuarios,
    { data: perfiles, error: errPerfiles },
    { data: casas, error: errCasas },
    { data: miembros, error: errMiembros },
    { data: historial, error: errHistorial },
    { data: tareas, error: errTareas },
    { data: itemsRefri, error: errItems },
    { data: listaCompras, error: errCompras },
    { data: gastos, error: errGastos },
    { data: pagos, error: errPagos },
    { data: notas, error: errNotas },
  ] = await Promise.all([
    obtenerTodosLosUsuarios(supabase),
    supabase.from('perfiles').select('id, nombre, apellido'),
    supabase.from('casas').select('id, nombre, created_at'),
    supabase.from('miembros_casa').select('usuario_id, casa_id'),
    supabase.from('historial_tareas').select('usuario_id, nombre_usuario, nombre_tarea, casa_id, completada_en'),
    supabase.from('tareas').select('creado_por, nombre, casa_id, created_at'),
    supabase.from('items_refri').select('creado_por, nombre, casa_id, created_at'),
    supabase
      .from('lista_compras')
      .select('agregado_por, comprado_por, nombre, casa_id, created_at, comprado, comprado_en'),
    supabase.from('gastos').select('creado_por, descripcion, monto, casa_id, created_at'),
    supabase.from('pagos').select('creado_por, monto, casa_id, created_at'),
    supabase.from('notas_casa').select('casa_id, actualizado_por, actualizado_en'),
  ]);

  for (const err of [errPerfiles, errCasas, errMiembros, errHistorial, errTareas, errItems, errCompras, errGastos, errPagos, errNotas]) {
    if (err) throw new Error(err.message);
  }

  const emailPorId = new Map(usuarios.map((u) => [u.id, u.email ?? '(sin email)']));
  const nombrePorId = new Map(
    (perfiles ?? []).map((p) => [p.id, [p.nombre, p.apellido].filter(Boolean).join(' ')])
  );
  const casaPorId = new Map((casas ?? []).map((c) => [c.id, c.nombre]));

  function nombreDeUsuario(id: string) {
    return nombrePorId.get(id) || emailPorId.get(id) || id;
  }

  // ---- Usuarios: altas y quién nunca volvió a entrar ----
  const usuariosNuncaVolvieron = usuarios.filter((u) => {
    if (!u.last_sign_in_at) return true;
    return Math.abs(new Date(u.last_sign_in_at).getTime() - new Date(u.created_at).getTime()) < UMBRAL_MISMO_LOGIN_MS;
  }).length;

  const altasPorDia = new Map<string, number>();
  for (const u of usuarios) {
    const dia = u.created_at.slice(0, 10);
    altasPorDia.set(dia, (altasPorDia.get(dia) ?? 0) + 1);
  }
  const registrosPorDia = [...altasPorDia.entries()].sort(([a], [b]) => a.localeCompare(b));

  const ultimoUsuarioRegistrado = usuarios.reduce<User | null>(
    (masReciente, u) => (!masReciente || u.created_at > masReciente.created_at ? u : masReciente),
    null
  );

  // Última vez que ALGUIEN entró a la app (no solo se registró): el
  // last_sign_in_at más reciente de todos los usuarios.
  const ultimoInicioSesion = usuarios.reduce<User | null>((masReciente, u) => {
    if (!u.last_sign_in_at) return masReciente;
    if (!masReciente?.last_sign_in_at || u.last_sign_in_at > masReciente.last_sign_in_at) return u;
    return masReciente;
  }, null);

  // ---- Casas: cuántas tienen 2+ miembros vs solo 1 ----
  const miembrosPorCasa = new Map<string, number>();
  for (const m of miembros ?? []) {
    miembrosPorCasa.set(m.casa_id, (miembrosPorCasa.get(m.casa_id) ?? 0) + 1);
  }
  const casasMultiMiembro = [...miembrosPorCasa.values()].filter((n) => n > 1).length;

  // ---- Función más usada: conteo por módulo ----
  const usoPorFuncion = [
    { funcion: 'Tareas completadas', total: historial?.length ?? 0 },
    { funcion: 'Tareas creadas', total: tareas?.length ?? 0 },
    { funcion: 'Items de refri agregados', total: itemsRefri?.length ?? 0 },
    { funcion: 'Lista de compras', total: listaCompras?.length ?? 0 },
    { funcion: 'Gastos registrados', total: gastos?.length ?? 0 },
    { funcion: 'Pagos registrados', total: pagos?.length ?? 0 },
    { funcion: 'Notas de casa actualizadas', total: notas?.length ?? 0 },
  ].sort((a, b) => b.total - a.total);

  // ---- Eventos combinados (para ranking de usuarios activos + feed) ----
  const eventos: EventoActividad[] = [];

  for (const h of historial ?? []) {
    eventos.push({
      tipo: 'tarea_completada',
      descripcion: `Completó "${h.nombre_tarea}"`,
      usuarioId: h.usuario_id,
      casaId: h.casa_id,
      fecha: h.completada_en,
    });
  }
  for (const t of tareas ?? []) {
    eventos.push({
      tipo: 'tarea_creada',
      descripcion: `Creó la tarea "${t.nombre}"`,
      usuarioId: t.creado_por,
      casaId: t.casa_id,
      fecha: t.created_at,
    });
  }
  for (const i of itemsRefri ?? []) {
    eventos.push({
      tipo: 'item_refri',
      descripcion: `Agregó "${i.nombre}" al refri`,
      usuarioId: i.creado_por,
      casaId: i.casa_id,
      fecha: i.created_at,
    });
  }
  for (const c of listaCompras ?? []) {
    eventos.push({
      tipo: 'compra',
      descripcion: `Agregó "${c.nombre}" a la lista`,
      usuarioId: c.agregado_por,
      casaId: c.casa_id,
      fecha: c.created_at,
    });
    // Marcar como comprado es una acción aparte, a veces de otro
    // miembro — cuenta como actividad propia para ese usuario.
    if (c.comprado && c.comprado_por && c.comprado_en) {
      eventos.push({
        tipo: 'compra',
        descripcion: `Marcó "${c.nombre}" como comprado`,
        usuarioId: c.comprado_por,
        casaId: c.casa_id,
        fecha: c.comprado_en,
      });
    }
  }
  for (const g of gastos ?? []) {
    eventos.push({
      tipo: 'gasto',
      descripcion: `Registró el gasto "${g.descripcion}" ($${g.monto})`,
      usuarioId: g.creado_por,
      casaId: g.casa_id,
      fecha: g.created_at,
    });
  }
  for (const p of pagos ?? []) {
    eventos.push({
      tipo: 'pago',
      descripcion: `Registró un pago de $${p.monto}`,
      usuarioId: p.creado_por,
      casaId: p.casa_id,
      fecha: p.created_at,
    });
  }
  for (const n of notas ?? []) {
    if (!n.actualizado_por) continue;
    eventos.push({
      tipo: 'nota',
      descripcion: 'Actualizó la nota de la casa',
      usuarioId: n.actualizado_por,
      casaId: n.casa_id,
      fecha: n.actualizado_en,
    });
  }

  // ---- Usuarios más activos: conteo total de eventos por usuario ----
  const conteoPorUsuario = new Map<string, number>();
  for (const e of eventos) {
    conteoPorUsuario.set(e.usuarioId, (conteoPorUsuario.get(e.usuarioId) ?? 0) + 1);
  }
  const usuariosMasActivos = [...conteoPorUsuario.entries()]
    .map(([usuarioId, total]) => ({ usuarioId, nombre: nombreDeUsuario(usuarioId), total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // ---- Feed de actividad reciente ----
  const eventosOrdenados = [...eventos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const actividadReciente = eventosOrdenados.slice(0, 20).map((e) => ({
    ...e,
    nombreUsuario: nombreDeUsuario(e.usuarioId),
    nombreCasa: casaPorId.get(e.casaId) ?? '(casa eliminada)',
  }));

  // Última acción con rastro en las tablas de contenido (el "log" real
  // de uso, a diferencia de un simple inicio de sesión sin hacer nada).
  const ultimaActividad = eventosOrdenados[0] && {
    descripcion: eventosOrdenados[0].descripcion,
    nombre: nombreDeUsuario(eventosOrdenados[0].usuarioId),
    fecha: eventosOrdenados[0].fecha,
  };

  return {
    resumen: {
      totalUsuarios: usuarios.length,
      usuariosNuncaVolvieron,
      totalCasas: casas?.length ?? 0,
      casasMultiMiembro,
      usuariosConActividad: conteoPorUsuario.size,
      ultimoUsuarioRegistrado: ultimoUsuarioRegistrado && {
        nombre: nombreDeUsuario(ultimoUsuarioRegistrado.id),
        fecha: ultimoUsuarioRegistrado.created_at,
      },
      ultimoInicioSesion: ultimoInicioSesion?.last_sign_in_at && {
        nombre: nombreDeUsuario(ultimoInicioSesion.id),
        fecha: ultimoInicioSesion.last_sign_in_at,
      },
      ultimaActividad,
    },
    registrosPorDia,
    usoPorFuncion,
    usuariosMasActivos,
    actividadReciente,
  };
});
