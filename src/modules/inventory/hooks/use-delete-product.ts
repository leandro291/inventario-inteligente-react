import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { deleteProduct } from '@/modules/inventory/services/products.service'

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    // onSettled: si el DELETE falla (p. ej. 404) igual se refresca el listado
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() }),
  })
}
