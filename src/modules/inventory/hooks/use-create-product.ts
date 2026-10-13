import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { createProduct } from '@/modules/inventory/services/products.service'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    // onSuccess: si el POST falla no hay nada nuevo que refrescar
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() }),
  })
}
