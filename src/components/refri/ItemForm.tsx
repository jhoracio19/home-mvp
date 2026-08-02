'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { categorias, HEX_CATEGORIA } from '@/lib/refri/categorias';
import type { CategoriaItem, TipoTracking } from '@/lib/types/database';

type ReferenciaItem = { nombre: string; categoria: 'fruta' | 'verdura'; dias_estimados: number };

type ItemInicial = {
  id: string;
  nombre: string;
  categoria: CategoriaItem;
  tipo_tracking: TipoTracking;
  fecha_entrada: string;
  fecha_caducidad: string | null;
  dias_estimados: number | null;
};

function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function ItemForm({
  referencia,
  itemInicial,
  action,
  textoBoton,
}: {
  referencia: ReferenciaItem[];
  itemInicial?: ItemInicial;
  action: (formData: FormData) => void;
  textoBoton?: string;
}) {
  const t = useTranslations('Refri');
  const tCategorias = useTranslations('Categorias');
  const [nombre, setNombre] = useState(itemInicial?.nombre ?? '');
  const [categoria, setCategoria] = useState<CategoriaItem>(itemInicial?.categoria ?? 'fruta');
  const [tipoTracking, setTipoTracking] = useState<TipoTracking>(itemInicial?.tipo_tracking ?? 'dias');
  const [diasEstimados, setDiasEstimados] = useState(
    itemInicial?.dias_estimados != null ? String(itemInicial.dias_estimados) : ''
  );
  const [fechaCaducidad, setFechaCaducidad] = useState(itemInicial?.fecha_caducidad ?? '');
  const [autocompletado, setAutocompletado] = useState(false);

  const referenciaPorNombre = useMemo(() => {
    const mapa = new Map<string, ReferenciaItem>();
    referencia.forEach((r) => mapa.set(normalizar(r.nombre), r));
    return mapa;
  }, [referencia]);

  const esFrutaOVerdura = categoria === 'fruta' || categoria === 'verdura';

  function manejarCambioNombre(valor: string) {
    setNombre(valor);
    if (!esFrutaOVerdura) return;

    const coincidencia = referenciaPorNombre.get(normalizar(valor));
    if (coincidencia) {
      setDiasEstimados(String(coincidencia.dias_estimados));
      setTipoTracking('dias');
      setAutocompletado(true);
    } else {
      setAutocompletado(false);
    }
  }

  return (
    <form action={action} className="space-y-4">
      <Input
        label={t('nombre')}
        name="nombre"
        value={nombre}
        onChange={(e) => manejarCambioNombre(e.target.value)}
        placeholder={t('ejemploNombre')}
        required
        maxLength={100}
      />

      <Select
        label={
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: HEX_CATEGORIA[categoria] }}
            />
            {t('categoria')}
          </span>
        }
        name="categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value as CategoriaItem)}
      >
        {categorias(tCategorias).map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>

      {esFrutaOVerdura && autocompletado && (
        <p className="text-xs font-medium text-cocoa dark:text-camel">{t('duracionAutocompletada')}</p>
      )}

      <div className="space-y-2">
        <span className="block text-sm font-semibold text-cocoa dark:text-linen">{t('comoControlarCaducidad')}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipoTracking('dias')}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tipoTracking === 'dias'
                ? 'border-espresso bg-espresso text-linen'
                : 'border-camel bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-linen'
            }`}
          >
            {t('porDias')}
          </button>
          <button
            type="button"
            onClick={() => setTipoTracking('fecha')}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tipoTracking === 'fecha'
                ? 'border-espresso bg-espresso text-linen'
                : 'border-camel bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-linen'
            }`}
          >
            {t('porFechaExacta')}
          </button>
        </div>
        <input type="hidden" name="tipo_tracking" value={tipoTracking} />
      </div>

      {tipoTracking === 'dias' ? (
        <Input
          label={t('diasEstimados')}
          name="dias_estimados"
          type="number"
          min={1}
          value={diasEstimados}
          onChange={(e) => {
            setDiasEstimados(e.target.value);
            setAutocompletado(false);
          }}
          required
        />
      ) : (
        <Input
          label={t('fechaCaducidad')}
          name="fecha_caducidad"
          type="date"
          value={fechaCaducidad}
          onChange={(e) => setFechaCaducidad(e.target.value)}
          required
        />
      )}

      <Input
        label={t('fechaEntrada')}
        name="fecha_entrada"
        type="date"
        defaultValue={itemInicial?.fecha_entrada ?? hoyISO()}
      />

      <SubmitButton className="w-full">{textoBoton ?? t('guardar')}</SubmitButton>
    </form>
  );
}
