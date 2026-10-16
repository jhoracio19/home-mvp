import type { CategoriaItem } from '@/lib/types/database';

const VALORES_CATEGORIA: CategoriaItem[] = ['fruta', 'verdura', 'lacteo', 'carne', 'preparado', 'otro'];

type Traductor = (key: string) => string;

export function categorias(t: Traductor): { value: CategoriaItem; label: string }[] {
  return VALORES_CATEGORIA.map((value) => ({ value, label: t(value) }));
}

export function esCategoriaValida(valor: string): valor is CategoriaItem {
  return (VALORES_CATEGORIA as string[]).includes(valor);
}

export function etiquetaCategoria(categoria: CategoriaItem, t: Traductor): string {
  return t(categoria);
}

// "Opción B" (mercado): cada categoría tiene su propio color real, en
// vez de que todo viva en el mismo tono café. HEX_CATEGORIA para casos
// que necesitan el valor crudo (ej. un punto de color inline);
// COLOR_CATEGORIA ya trae las clases listas para una pastilla/badge.
export const HEX_CATEGORIA: Record<CategoriaItem, string> = {
  fruta: '#C06E1F',
  verdura: '#2E7D52',
  lacteo: '#3E7A96',
  carne: '#9C4038',
  preparado: '#7B5EA7',
  otro: '#5E6B70',
};

export const COLOR_CATEGORIA: Record<CategoriaItem, string> = {
  fruta: 'border-[#C06E1F]/50 bg-[#C06E1F]/15 text-[#C06E1F] dark:bg-[#C06E1F]/20',
  verdura: 'border-success/50 bg-success/15 text-success dark:bg-success/20',
  lacteo: 'border-[#3E7A96]/50 bg-[#3E7A96]/15 text-[#3E7A96] dark:bg-[#3E7A96]/20',
  carne: 'border-[#9C4038]/50 bg-[#9C4038]/15 text-[#9C4038] dark:bg-[#9C4038]/20',
  preparado: 'border-[#7B5EA7]/50 bg-[#7B5EA7]/15 text-[#7B5EA7] dark:bg-[#7B5EA7]/20',
  otro: 'border-[#5E6B70]/50 bg-[#5E6B70]/15 text-[#5E6B70] dark:bg-[#5E6B70]/20',
};
