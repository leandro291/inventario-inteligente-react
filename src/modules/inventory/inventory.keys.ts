export const inventoryKeys = {
  all: ['inventory'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
}
