// Este archivo tiene BUGS a propósito
// Para demostrar debugging con Claude Code

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface CartItem {
  product: Product
  quantity: number
}

// BUG 1: No valida cantidad negativa
export function addToCart(
  cart: CartItem[],
  product: Product,
  quantity: number
): CartItem[] {
  const existingItem = cart.find((item) => item.product.id === product.id)

  if (existingItem) {
    // BUG 2: Modifica el array original en lugar de crear uno nuevo
    existingItem.quantity += quantity
    return cart
  }

  return [...cart, { product, quantity }]
}

// BUG 3: No maneja división por cero
export function calculateAveragePrice(products: Product[]): number {
  const total = products.reduce((sum, p) => sum + p.price, 0)
  return total / products.length
}

// BUG 4: Comparación incorrecta de strings
export function searchProducts(products: Product[], query: string): Product[] {
  return products.filter((p) => p.name == query)
}

// BUG 5: No considera stock insuficiente
export function processOrder(cart: CartItem[]): { success: boolean; total: number } {
  const total = cart.reduce((sum, item) => {
    return sum + item.product.price * item.quantity
  }, 0)

  return { success: true, total }
}

// BUG 6: Posible null reference
export function getProductDiscount(product: Product | null): number {
  if (product.price > 100) {
    return product.price * 0.1
  }
  return 0
}
