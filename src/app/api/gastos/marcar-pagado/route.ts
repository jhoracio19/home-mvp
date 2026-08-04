import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notificarPagoConfirmado } from '@/lib/notificaciones/gastos';

const MONTO_MAXIMO = 999999.99;

// Llamado por el service worker (public/sw.js) cuando alguien toca
// "Marcar como pagado" en el push de "X te debe $Y" — sin abrir la
// app. Por eso es una Route Handler y no un Server Action: necesita
// devolver una respuesta JSON simple que el fetch del service worker
// pueda leer, no una redirección de página. Misma validación que
// registrarPago en gastos/actions.ts (el flujo manual desde la UI).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'sin-sesion' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const deUsuarioId = typeof body?.deUsuarioId === 'string' ? body.deUsuarioId : '';
  const casaId = typeof body?.casaId === 'string' ? body.casaId : '';
  const monto = Number(body?.monto);

  if (!deUsuarioId || deUsuarioId === user.id || !casaId || !monto || monto <= 0) {
    return NextResponse.json({ error: 'datos-invalidos' }, { status: 400 });
  }
  if (monto > MONTO_MAXIMO) {
    return NextResponse.json({ error: 'monto-invalido' }, { status: 400 });
  }

  // miembros_casa_con_perfil ya filtra por is_member_of_casa(p_casa_id)
  // contra quien llama (auth.uid()) — si el usuario actual no es
  // miembro de esa casa, regresa vacío y ninguna de las dos
  // comprobaciones de abajo pasa.
  const { data: miembros, error: errorMiembros } = await supabase.rpc('miembros_casa_con_perfil', {
    p_casa_id: casaId,
  });

  if (errorMiembros || !miembros?.some((m) => m.usuario_id === user.id)) {
    return NextResponse.json({ error: 'no-autorizado' }, { status: 403 });
  }
  if (!miembros.some((m) => m.usuario_id === deUsuarioId)) {
    return NextResponse.json({ error: 'deudor-invalido' }, { status: 400 });
  }

  const { error } = await supabase.from('pagos').insert({
    casa_id: casaId,
    de_usuario_id: deUsuarioId,
    a_usuario_id: user.id,
    monto,
    creado_por: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await notificarPagoConfirmado(deUsuarioId, monto);

  return NextResponse.json({ ok: true });
}
