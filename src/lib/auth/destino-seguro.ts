// '/casas' (elegir casa) es el destino por defecto tras iniciar sesión —
// nunca auto-entra a una casa específica. Cualquier `next` explícito debe
// empezar con '/' (y no con '//', que los navegadores tratan como un
// dominio externo) para que nadie pueda usar este parámetro para
// mandar a alguien a un sitio fuera de la app después de un login real
// (un clásico "open redirect" usado para phishing).
export function destinoSeguro(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/casas';
}
