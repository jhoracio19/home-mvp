import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

// Cliente con la service role key: bypassa RLS a propósito. Solo debe
// usarse en contextos server-only sin sesión de usuario (ej. el cron
// de notificaciones), donde se necesita leer datos de todos los
// usuarios, no solo los del que hace la petición.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
