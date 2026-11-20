// Operaciones puras del CRUD local. Se reutilizan desde la interfaz y las pruebas.
export function upsertProduct(products, product) {
  const id = Number(product.id);
  if (Number.isSafeInteger(id) && id > 0) {
    if (!products.some((p) => Number(p.id) === id)) {
      throw new Error('No se encontró el producto que intentas modificar.');
    }
    return products.map((p) => Number(p.id) === id ? { ...p, ...product, id } : p);
  }
  const nextId = Math.max(0, ...products.map((p) => Number(p.id) || 0)) + 1;
  return [...products, { ...product, id: nextId }];
}

export function removeProduct(products, id) {
  return products.filter((p) => Number(p.id) !== Number(id));
}
