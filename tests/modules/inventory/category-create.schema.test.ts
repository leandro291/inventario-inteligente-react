import { describe, expect, it } from 'vitest'
import { categoryCreateSchema } from '@/modules/inventory/schemas/category.schema'

const MSG = 'Entre 3 y 100 caracteres.'

function nombreMessage(nombre: string) {
  const result = categoryCreateSchema.safeParse({ nombre })
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('categoryCreateSchema', () => {
  it('acepta un nombre válido y lo recorta', () => {
    expect(categoryCreateSchema.parse({ nombre: '  Bebidas  ' })).toEqual({
      nombre: 'Bebidas',
    })
  })

  it('rechaza nombre de 2 caracteres', () => {
    expect(nombreMessage('ab')).toBe(MSG)
  })

  it('rechaza nombre solo con espacios', () => {
    expect(nombreMessage('     ')).toBe(MSG)
  })

  it('rechaza nombre de 101 caracteres', () => {
    expect(nombreMessage('a'.repeat(101))).toBe(MSG)
  })

  it('acepta nombre de 3 y 100 caracteres', () => {
    expect(nombreMessage('abc')).toBeUndefined()
    expect(nombreMessage('a'.repeat(100))).toBeUndefined()
  })
})
