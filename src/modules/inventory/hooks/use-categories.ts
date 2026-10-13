import { useQuery } from '@tanstack/react-query'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { getCategories } from '@/modules/inventory/services/categories.service'

export function useCategories() {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: getCategories,
  })
}
