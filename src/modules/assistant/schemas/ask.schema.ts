import { z } from 'zod'

export const askSchema = z.object({
  pregunta: z.string().trim().min(3).max(500),
  thread_id: z.string().min(1).max(100),
})

export const answerSchema = z.object({
  respuesta: z.string(),
})

export type AskInput = z.infer<typeof askSchema>
export type Answer = z.infer<typeof answerSchema>
