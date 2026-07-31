import { headers } from 'next/headers';

// El header Origin solo llega en requests tipo fetch/POST (nuestras
// Server Actions de auth lo usan así). Para renders normales (GET,
// como esta página) hay que armar la URL desde host + proto.
export async function getSiteUrl() {
  const h = await headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  return host ? `${proto}://${host}` : '';
}
