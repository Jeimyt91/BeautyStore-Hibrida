// Datos tomados de ProductListActivity.kt y ProductListFragment.kt del proyecto original.
export const initialProducts = [
  { id: 1, nombre: 'Corte de Cabello', precio: 30000, imagen: '/images/corte.jpg' },
  { id: 2, nombre: 'Facial', precio: 20000, imagen: '/images/facial.webp' },
  { id: 3, nombre: 'Manicura', precio: 18000, imagen: '/images/manicura.jpg' },
  { id: 4, nombre: 'Colorimetría', precio: 100000, imagen: '/images/colorimetria.jpg' }
];

export function normalizeProduct(p) {
  return {
    id: Number(p.id),
    nombre: String(p.nombre ?? '').trim(),
    precio: Number(p.precio),
    imagen: /^\/(images)\/[\w.\-]+$/.test(String(p.imagen ?? '')) ? p.imagen : '/images/logo.png'
  };
}

export function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
