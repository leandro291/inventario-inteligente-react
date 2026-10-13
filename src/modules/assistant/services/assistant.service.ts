import { isAxiosError } from 'axios'
import { api } from '@/lib/api'
import {
  answerSchema,
  askSchema,
  type Answer,
  type AskInput,
} from '@/modules/assistant/schemas/ask.schema'

export async function ask(input: AskInput): Promise<Answer> {
  // parse recorta la pregunta y garantiza el body aunque el llamador no pase por el form
  const body = askSchema.parse(input)
  const { data } = await api.post<unknown>('/ai/preguntar', body)
  return answerSchema.parse(data)
}

// Vive acá porque el servicio es la capa HTTP: único lugar fuera de lib/api que conoce axios
export function getAskErrorMessage(error: unknown): string {
  return isAxiosError(error) && error.response?.status === 502
    ? 'Falló el agente, intentá de nuevo.'
    : 'No se pudo contactar al asistente.'
}
