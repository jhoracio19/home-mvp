// Función pura, sin dependencias de servidor (next/headers, etc.), para
// que la puedan importar tanto Server Components como Client Components
// (ej. TareaForm) sin arrastrar código server-only al bundle del cliente.
export function nombreMiembro(m: { email: string; nombre: string | null; apellido: string | null }) {
  if (m.nombre && m.apellido) return `${m.nombre} ${m.apellido}`;
  return m.email;
}
