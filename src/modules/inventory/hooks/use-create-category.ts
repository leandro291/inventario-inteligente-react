import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { createCategory } from '@/modules/inventory/services/categories.service'

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    // onSuccess: si el POST falla no hay nada nuevo que refrescar
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() }),
  })
}
