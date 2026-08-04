'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { diasSemana } from '@/lib/tareas/dias-semana';
import type { TipoFrecuencia } from '@/lib/types/database';

type Miembro = { usuario_id: string; email: string; rol: string; nombre: string | null; apellido: string | null };

type TareaInicial = {
  nombre: string;
  tipo_frecuencia: TipoFrecuencia;
  frecuencia_dias: number | null;
  dias_semana: number[] | null;
  fecha_evento: string | null;
  asignado_a: string | null;
};

export function TareaForm({
  miembros,
  tareaInicial,
  action,
  textoBoton,
}: {
  miembros: Miembro[];
  tareaInicial?: TareaInicial;
  action: (formData: FormData) => void;
  textoBoton?: string;
}) {
  const t = useTranslations('Tareas');
  const tDias = useTranslations('Dias');
  const [tipoFrecuencia, setTipoFrecuencia] = useState<TipoFrecuencia>(
    tareaInicial?.tipo_frecuencia ?? 'intervalo'
  );
  const [frecuenciaDias, setFrecuenciaDias] = useState(
    tareaInicial?.frecuencia_dias != null ? String(tareaInicial.frecuencia_dias) : ''
  );
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>(tareaInicial?.dias_semana ?? []);
  const [fechaEvento, setFechaEvento] = useState(tareaInicial?.fecha_evento ?? '');

  function alternarDia(valor: number) {
    setDiasSeleccionados((actual) =>
      actual.includes(valor) ? actual.filter((d) => d !== valor) : [...actual, valor]
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Input
        label={t('nombreDeLaTarea')}
        name="nombre"
        placeholder={t('ejemploNombre')}
        defaultValue={tareaInicial?.nombre}
        required
        maxLength={100}
      />

      <div className="space-y-2">
        <span className="block text-sm font-semibold text-cocoa dark:text-linen">{t('comoSeRepite')}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipoFrecuencia('intervalo')}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tipoFrecuencia === 'intervalo'
                ? 'border-espresso bg-espresso text-linen'
                : 'border-camel bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-linen'
            }`}
          >
            {t('cadaNDias')}
          </button>
          <button
            type="button"
            onClick={() => setTipoFrecuencia('dias_semana')}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tipoFrecuencia === 'dias_semana'
                ? 'border-espresso bg-espresso text-linen'
                : 'border-camel bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-linen'
            }`}
          >
            {t('diasDeLaSemana')}
          </button>
          <button
            type="button"
            onClick={() => setTipoFrecuencia('unica')}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tipoFrecuencia === 'unica'
                ? 'border-espresso bg-espresso text-linen'
                : 'border-camel bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-linen'
            }`}
          >
            {t('eventoUnico')}
          </button>
        </div>
        <input type="hidden" name="tipo_frecuencia" value={tipoFrecuencia} />
      </div>

      {tipoFrecuencia === 'intervalo' ? (
        <Input
          label={t('cadaCuantosDias')}
          name="frecuencia_dias"
          type="number"
          min={1}
          value={frecuenciaDias}
          onChange={(e) => setFrecuenciaDias(e.target.value)}
          required
        />
      ) : tipoFrecuencia === 'dias_semana' ? (
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-cocoa dark:text-linen">{t('queDiasToca')}</span>
          <div className="grid grid-cols-7 gap-1.5">
            {diasSemana(tDias).map((dia) => {
              const activo = diasSeleccionados.includes(dia.valor);
              return (
                <button
                  key={dia.valor}
                  type="button"
                  onClick={() => alternarDia(dia.valor)}
                  aria-pressed={activo}
                  aria-label={dia.nombre}
                  className={`aspect-square rounded-lg border-2 text-sm font-bold transition-colors ${
                    activo
                      ? 'border-espresso bg-espresso text-linen'
                      : 'border-camel bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-linen'
                  }`}
                >
                  {dia.corta}
                </button>
              );
            })}
          </div>
          {diasSeleccionados.map((d) => (
            <input key={d} type="hidden" name="dias_semana" value={d} />
          ))}
        </div>
      ) : (
        <Input
          label={t('fechaEvento')}
          name="fecha_evento"
          type="date"
          value={fechaEvento}
          onChange={(e) => setFechaEvento(e.target.value)}
        />
      )}

      <Select label={t('asignarA')} name="asignado_a" defaultValue={tareaInicial?.asignado_a ?? ''}>
        <option value="">{t('sinAsignar')}</option>
        {miembros.map((m) => (
          <option key={m.usuario_id} value={m.usuario_id}>
            {nombreMiembro(m)}
          </option>
        ))}
      </Select>
      <SubmitButton className="w-full">{textoBoton ?? t('guardar')}</SubmitButton>
    </form>
  );
}
