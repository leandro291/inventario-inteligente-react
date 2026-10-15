import { describe, expect, it } from 'vitest'
import { answerSchema, askSchema } from '@/modules/assistant/schemas/ask.schema'

const valid = { pregunta: 'Hola', thread_id: 't1' }

describe('askSchema', () => {
  it('acepta datos válidos y recorta la pregunta', () => {
    expect(askSchema.parse({ ...valid, pregunta: '  Hola  ' })).toEqual(valid)
  })

  it('pregunta: acepta 3 y 500 caracteres, rechaza 2 y 501', () => {
    expect(askSchema.safeParse({ ...valid, pregunta: 'abc' }).success).toBe(
      true,
    )
    expect(
      askSchema.safeParse({ ...valid, pregunta: 'a'.repeat(500) }).success,
    ).toBe(true)
    expect(askSchema.safeParse({ ...valid, pregunta: 'ab' }).success).toBe(
      false,
    )
    expect(
      askSchema.safeParse({ ...valid, pregunta: 'a'.repeat(501) }).success,
    ).toBe(false)
  })

  it('pregunta: cuenta los caracteres ya recortados', () => {
    expect(askSchema.safeParse({ ...valid, pregunta: '  ab  ' }).success).toBe(
      false,
    )
  })

  it('thread_id: rechaza vacío y 101 caracteres, acepta 100', () => {
    expect(askSchema.safeParse({ ...valid, thread_id: '' }).success).toBe(false)
    expect(
      askSchema.safeParse({ ...valid, thread_id: 'a'.repeat(101) }).success,
    ).toBe(false)
    expect(
      askSchema.safeParse({ ...valid, thread_id: 'a'.repeat(100) }).success,
    ).toBe(true)
  })
})

describe('answerSchema', () => {
  it('exige respuesta string', () => {
    expect(answerSchema.parse({ respuesta: 'ok' })).toEqual({ respuesta: 'ok' })
    expect(answerSchema.safeParse({ respuesta: 1 }).success).toBe(false)
    expect(answerSchema.safeParse({}).success).toBe(false)
  })
})
