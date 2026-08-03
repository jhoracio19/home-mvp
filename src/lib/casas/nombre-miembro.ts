// Función pura, sin dependencias de servidor (next/headers, etc.), para
// que la puedan importar tanto Server Components como Client Components
// (ej. TareaForm) sin arrastrar código server-only al bundle del cliente.
//
// El registro ahora solo pide un nickname (campo `nombre`) — `apellido`
// ya no se pregunta, pero se sigue mostrando si una cuenta vieja ya lo
// tenía guardado (nadie pierde lo que ya tenía puesto).
export function nombreMiembro(m: { email: string; nombre: string | null; apellido: string | null }) {
  if (!m.nombre) return m.email;
  return m.apellido ? `${m.nombre} ${m.apellido}` : m.nombre;
}
