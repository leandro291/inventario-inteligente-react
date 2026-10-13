import { useMutation } from '@tanstack/react-query'
import { ask } from '@/modules/assistant/services/assistant.service'

// Sin invalidaciones: el agente es de solo lectura
export function useAsk() {
  return useMutation({ mutationFn: ask })
}
