export function addToCart(cart, product) {
  const id = Number(product.id);
  const current = cart.find((item) => item.id === id);
  if (current) return cart.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item);
  return [...cart, { id, nombre: String(product.nombre), precio: Number(product.precio), cantidad: 1 }];
}

export function changeQuantity(cart, id, delta) {
  return cart.map((item) => item.id === Number(id)
    ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item)
    .filter((item) => item.cantidad > 0);
}

export function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0);
}

export function cartCount(cart) {
  return cart.reduce((sum, item) => sum + Number(item.cantidad), 0);
}
