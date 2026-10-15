import { useMutation } from '@tanstack/react-query'
import {
  ask,
  getAskErrorMessage,
} from '@/modules/assistant/services/assistant.service'

// Sin invalidaciones: el agente es de solo lectura
export function useAsk() {
  const mutation = useMutation({ mutationFn: ask })
  const errorMessage = mutation.isError
    ? getAskErrorMessage(mutation.error)
    : null
  return { ...mutation, errorMessage }
}
