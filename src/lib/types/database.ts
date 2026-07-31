// Tipos manuales que reflejan supabase/schema.sql.
// Si el schema cambia, regenerar idealmente con:
//   npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
//
// `Relationships: []` y `Views`/`Functions` vacíos son requeridos por la
// forma `GenericSchema` que espera @supabase/supabase-js internamente;
// sin ellos el type-checker colapsa todas las Rows a `never`.

export type Rol = 'admin' | 'miembro';
export type CategoriaItem = 'fruta' | 'verdura' | 'lacteo' | 'carne' | 'preparado' | 'otro';
export type TipoTracking = 'dias' | 'fecha';

export interface Database {
  public: {
    Tables: {
      casas: {
        Row: {
          id: string;
          nombre: string;
          creada_por: string;
          created_at: string;
          codigo_invitacion: string | null;
          codigo_invitacion_expira: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          creada_por: string;
          created_at?: string;
          codigo_invitacion?: string | null;
          codigo_invitacion_expira?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          creada_por?: string;
          created_at?: string;
          codigo_invitacion?: string | null;
          codigo_invitacion_expira?: string | null;
        };
        Relationships: [];
      };
      miembros_casa: {
        Row: {
          usuario_id: string;
          casa_id: string;
          rol: Rol;
          created_at: string;
        };
        Insert: {
          usuario_id: string;
          casa_id: string;
          rol?: Rol;
          created_at?: string;
        };
        Update: {
          usuario_id?: string;
          casa_id?: string;
          rol?: Rol;
          created_at?: string;
        };
        Relationships: [];
      };
      referencia_caducidad: {
        Row: {
          nombre: string;
          categoria: 'fruta' | 'verdura';
          dias_estimados: number;
        };
        Insert: {
          nombre: string;
          categoria: 'fruta' | 'verdura';
          dias_estimados: number;
        };
        Update: {
          nombre?: string;
          categoria?: 'fruta' | 'verdura';
          dias_estimados?: number;
        };
        Relationships: [];
      };
      items_refri: {
        Row: {
          id: string;
          casa_id: string;
          nombre: string;
          categoria: CategoriaItem;
          tipo_tracking: TipoTracking;
          fecha_entrada: string;
          fecha_caducidad: string | null;
          dias_estimados: number | null;
          creado_por: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          casa_id: string;
          nombre: string;
          categoria: CategoriaItem;
          tipo_tracking: TipoTracking;
          fecha_entrada?: string;
          fecha_caducidad?: string | null;
          dias_estimados?: number | null;
          creado_por: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          casa_id?: string;
          nombre?: string;
          categoria?: CategoriaItem;
          tipo_tracking?: TipoTracking;
          fecha_entrada?: string;
          fecha_caducidad?: string | null;
          dias_estimados?: number | null;
          creado_por?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tareas: {
        Row: {
          id: string;
          casa_id: string;
          nombre: string;
          frecuencia_dias: number;
          asignado_a: string | null;
          ultima_ejecucion: string | null;
          creado_por: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          casa_id: string;
          nombre: string;
          frecuencia_dias: number;
          asignado_a?: string | null;
          ultima_ejecucion?: string | null;
          creado_por: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          casa_id?: string;
          nombre?: string;
          frecuencia_dias?: number;
          asignado_a?: string | null;
          ultima_ejecucion?: string | null;
          creado_por?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      miembros_casa_con_email: {
        Args: { p_casa_id: string };
        Returns: { usuario_id: string; email: string; rol: Rol }[];
      };
      previsualizar_invitacion: {
        Args: { p_codigo: string };
        Returns: { casa_id: string; nombre: string }[];
      };
      unirse_a_casa: {
        Args: { p_codigo: string };
        Returns: string;
      };
    };
  };
}
