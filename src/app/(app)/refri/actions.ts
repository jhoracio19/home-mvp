'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';
import { esCategoriaValida } from '@/lib/refri/categorias';
import type { TipoTracking } from '@/lib/types/database';

function esTrackingValido(valor: string): valor is TipoTracking {
  return valor === 'dias' || valor === 'fecha';
}

const MAX_NOMBRE = 100;

function leerCamposFormulario(formData: FormData) {
  return {
    nombre: String(formData.get('nombre') ?? '').trim(),
    categoria: String(formData.get('categoria') ?? ''),
    tipoTracking: String(formData.get('tipo_tracking') ?? ''),
    fechaEntrada: String(formData.get('fecha_entrada') ?? '').trim(),
    fechaCaducidad: String(formData.get('fecha_caducidad') ?? '').trim(),
    diasEstimadosRaw: String(formData.get('dias_estimados') ?? '').trim(),
  };
}

export async function crearItem(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();
  const campos = leerCamposFormulario(formData);

  if (!campos.nombre || !esCategoriaValida(campos.categoria) || !esTrackingValido(campos.tipoTracking)) {
    redirect(`/refri/nuevo?error=${encodeURIComponent('Completa nombre, categoría y tipo de seguimiento.')}`);
  }
  if (campos.nombre.length > MAX_NOMBRE) {
    redirect(`/refri/nuevo?error=${encodeURIComponent(`El nombre no puede pasar de ${MAX_NOMBRE} caracteres.`)}`);
  }

  const diasEstimados = campos.diasEstimadosRaw ? Number(campos.diasEstimadosRaw) : null;
  if (campos.tipoTracking === 'dias' && (!diasEstimados || diasEstimados <= 0)) {
    redirect(`/refri/nuevo?error=${encodeURIComponent('Indica cuántos días dura.')}`);
  }
  if (campos.tipoTracking === 'fecha' && !campos.fechaCaducidad) {
    redirect(`/refri/nuevo?error=${encodeURIComponent('Indica la fecha de caducidad.')}`);
  }

  const { error } = await supabase.from('items_refri').insert({
    casa_id: casa.id,
    nombre: campos.nombre,
    categoria: campos.categoria,
    tipo_tracking: campos.tipoTracking,
    fecha_entrada: campos.fechaEntrada || undefined,
    fecha_caducidad: campos.tipoTracking === 'fecha' ? campos.fechaCaducidad : null,
    dias_estimados: campos.tipoTracking === 'dias' ? diasEstimados : null,
    creado_por: user.id,
  });

  if (error) {
    redirect(`/refri/nuevo?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

export async function actualizarItem(itemId: string, formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();
  const campos = leerCamposFormulario(formData);

  if (!campos.nombre || !esCategoriaValida(campos.categoria) || !esTrackingValido(campos.tipoTracking)) {
    redirect(
      `/refri/${itemId}/editar?error=${encodeURIComponent('Completa nombre, categoría y tipo de seguimiento.')}`
    );
  }
  if (campos.nombre.length > MAX_NOMBRE) {
    redirect(
      `/refri/${itemId}/editar?error=${encodeURIComponent(`El nombre no puede pasar de ${MAX_NOMBRE} caracteres.`)}`
    );
  }

  const diasEstimados = campos.diasEstimadosRaw ? Number(campos.diasEstimadosRaw) : null;
  if (campos.tipoTracking === 'dias' && (!diasEstimados || diasEstimados <= 0)) {
    redirect(`/refri/${itemId}/editar?error=${encodeURIComponent('Indica cuántos días dura.')}`);
  }
  if (campos.tipoTracking === 'fecha' && !campos.fechaCaducidad) {
    redirect(`/refri/${itemId}/editar?error=${encodeURIComponent('Indica la fecha de caducidad.')}`);
  }

  const { error } = await supabase
    .from('items_refri')
    .update({
      nombre: campos.nombre,
      categoria: campos.categoria,
      tipo_tracking: campos.tipoTracking,
      fecha_entrada: campos.fechaEntrada || undefined,
      fecha_caducidad: campos.tipoTracking === 'fecha' ? campos.fechaCaducidad : null,
      dias_estimados: campos.tipoTracking === 'dias' ? diasEstimados : null,
    })
    .eq('id', itemId)
    .eq('casa_id', casa.id);

  if (error) {
    redirect(`/refri/${itemId}/editar?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

// Se usa con .bind(null, item.id) desde un <form> por cada item listado.
export async function eliminarItem(itemId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('items_refri').delete().eq('id', itemId).eq('casa_id', casa.id);

  redirect('/dashboard');
}
