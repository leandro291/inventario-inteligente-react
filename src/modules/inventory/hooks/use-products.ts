import { useQuery } from '@tanstack/react-query'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { getProducts } from '@/modules/inventory/services/products.service'

export function useProducts() {
  return useQuery({
    queryKey: inventoryKeys.products(),
    queryFn: getProducts,
  })
}
