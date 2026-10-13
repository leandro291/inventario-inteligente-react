import { describe, expect, it } from 'vitest'
import { productCreateSchema } from '@/modules/inventory/schemas/product.schema'

const valid = { nombre: 'Mouse', precio: 2.5, stock: 5, category_id: 1 }

function messages(input: unknown) {
  const result = productCreateSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((i) => [String(i.path[0]), i.message]),
  )
}

describe('productCreateSchema', () => {
  it('acepta datos válidos y recorta el nombre', () => {
    expect(
      productCreateSchema.parse({ ...valid, nombre: '  Mouse  ' }),
    ).toEqual(valid)
  })

  it('devuelve el mensaje de cada regla (nombre 2 chars, precio 0, stock 1.5, sin categoría)', () => {
    expect(
      messages({ nombre: 'ab', precio: 0, stock: 1.5, category_id: NaN }),
    ).toEqual({
      nombre: 'Entre 3 y 100 caracteres.',
      precio: 'Tiene que ser mayor a 0.',
      stock: 'Tiene que ser un entero ≥ 0.',
      category_id: 'Elegí una categoría.',
    })
  })

  it('campos numéricos vacíos (NaN) fallan con el mensaje de su regla', () => {
    expect(
      messages({ ...valid, precio: NaN, stock: NaN, category_id: NaN }),
    ).toEqual({
      precio: 'Tiene que ser mayor a 0.',
      stock: 'Tiene que ser un entero ≥ 0.',
      category_id: 'Elegí una categoría.',
    })
  })

  it('rechaza nombre solo con espacios, de más de 100, stock negativo y category_id 0', () => {
    expect(messages({ ...valid, nombre: '   ' }).nombre).toBe(
      'Entre 3 y 100 caracteres.',
    )
    expect(messages({ ...valid, nombre: 'a'.repeat(101) }).nombre).toBe(
      'Entre 3 y 100 caracteres.',
    )
    expect(messages({ ...valid, stock: -1 }).stock).toBe(
      'Tiene que ser un entero ≥ 0.',
    )
    expect(messages({ ...valid, category_id: 0 }).category_id).toBe(
      'Elegí una categoría.',
    )
  })

  it('acepta stock 0 y nombre de 3 y 100 caracteres', () => {
    expect(messages({ ...valid, stock: 0 })).toEqual({})
    expect(messages({ ...valid, nombre: 'abc' })).toEqual({})
    expect(messages({ ...valid, nombre: 'a'.repeat(100) })).toEqual({})
  })
})
