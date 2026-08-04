import { notFound } from 'next/navigation';
import { getUsuarioActual } from '@/lib/casas/data';

// Panel interno de superusuario: solo para revisar actividad de la app
// sin depender de consultar Supabase directo. No hay UI para gestionar
// esta lista a propósito — es de uso personal, no una feature de
// producto con roles.
const ADMIN_EMAILS = ['jhoracioag11@gmail.com'];

export function esAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

// notFound() (no redirect a /login o /dashboard) a propósito: para
// cualquier cuenta que no sea admin, /admin simplemente no existe.
export async function requireAdmin() {
  const user = await getUsuarioActual();
  if (!esAdmin(user.email)) notFound();
  return user;
}
