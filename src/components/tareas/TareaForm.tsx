import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SubmitButton } from '@/components/ui/SubmitButton';

type Miembro = { usuario_id: string; email: string; rol: string };

type TareaInicial = {
  nombre: string;
  frecuencia_dias: number;
  asignado_a: string | null;
};

// Server Component: sin estado propio ni lógica cruzada entre campos,
// así que no necesita 'use client' (a diferencia de ItemForm).
export function TareaForm({
  miembros,
  tareaInicial,
  action,
  textoBoton = 'Guardar',
}: {
  miembros: Miembro[];
  tareaInicial?: TareaInicial;
  action: (formData: FormData) => void;
  textoBoton?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <Input
        label="Nombre de la tarea"
        name="nombre"
        placeholder="Ej. Sacar la basura"
        defaultValue={tareaInicial?.nombre}
        required
      />
      <Input
        label="Cada cuántos días se repite"
        name="frecuencia_dias"
        type="number"
        min={1}
        defaultValue={tareaInicial?.frecuencia_dias}
        required
      />
      <Select label="Asignar a" name="asignado_a" defaultValue={tareaInicial?.asignado_a ?? ''}>
        <option value="">Sin asignar</option>
        {miembros.map((m) => (
          <option key={m.usuario_id} value={m.usuario_id}>
            {m.email}
          </option>
        ))}
      </Select>
      <SubmitButton className="w-full">{textoBoton}</SubmitButton>
    </form>
  );
}
