import type { CategoriaItem } from '@/lib/types/database';

export const CATEGORIAS: { value: CategoriaItem; label: string }[] = [
  { value: 'fruta', label: 'Fruta' },
  { value: 'verdura', label: 'Verdura' },
  { value: 'lacteo', label: 'Lácteo' },
  { value: 'carne', label: 'Carne' },
  { value: 'preparado', label: 'Preparado' },
  { value: 'otro', label: 'Otro' },
];

const VALORES_CATEGORIA = CATEGORIAS.map((c) => c.value);

export function esCategoriaValida(valor: string): valor is CategoriaItem {
  return (VALORES_CATEGORIA as string[]).includes(valor);
}

export function etiquetaCategoria(categoria: CategoriaItem): string {
  return CATEGORIAS.find((c) => c.value === categoria)?.label ?? categoria;
}
