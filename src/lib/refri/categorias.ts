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
  fruta: '#E08E45',
  verdura: '#6B8F5A',
  lacteo: '#6E93A8',
  carne: '#B4573F',
  preparado: '#8B6B9E',
  otro: '#8A7A64',
};

export const COLOR_CATEGORIA: Record<CategoriaItem, string> = {
  fruta: 'border-[#E08E45]/50 bg-[#E08E45]/15 text-[#E08E45] dark:bg-[#E08E45]/20',
  verdura: 'border-[#6B8F5A]/50 bg-[#6B8F5A]/15 text-[#6B8F5A] dark:bg-[#6B8F5A]/20',
  lacteo: 'border-[#6E93A8]/50 bg-[#6E93A8]/15 text-[#6E93A8] dark:bg-[#6E93A8]/20',
  carne: 'border-[#B4573F]/50 bg-[#B4573F]/15 text-[#B4573F] dark:bg-[#B4573F]/20',
  preparado: 'border-[#8B6B9E]/50 bg-[#8B6B9E]/15 text-[#8B6B9E] dark:bg-[#8B6B9E]/20',
  otro: 'border-[#8A7A64]/50 bg-[#8A7A64]/15 text-[#8A7A64] dark:bg-[#8A7A64]/20',
};
