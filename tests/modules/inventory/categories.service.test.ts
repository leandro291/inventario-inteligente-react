import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import {
  createCategory,
  getCategories,
} from '@/modules/inventory/services/categories.service'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)

describe('getCategories', () => {
  beforeEach(() => get.mockReset())

  it('pide /categories/ y devuelve las categorías validadas', async () => {
    const categories = [{ id: 1, nombre: 'Bebidas' }]
    get.mockResolvedValue({ data: categories })

    await expect(getCategories()).resolves.toEqual(categories)
    expect(get).toHaveBeenCalledWith('/categories/')
  })

  it('rechaza si la respuesta no cumple el schema', async () => {
    get.mockResolvedValue({ data: [{ id: 'uno', nombre: 'Bebidas' }] })

    await expect(getCategories()).rejects.toThrow()
  })
})

describe('createCategory', () => {
  beforeEach(() => post.mockReset())

  it('hace POST /categories/ con el nombre recortado y devuelve la categoría parseada', async () => {
    const category = { id: 3, nombre: 'Bebidas' }
    post.mockResolvedValue({ data: category })

    await expect(createCategory({ nombre: '  Bebidas  ' })).resolves.toEqual(
      category,
    )
    expect(post).toHaveBeenCalledWith('/categories/', { nombre: 'Bebidas' })
  })

  it('rechaza sin llamar al back si el nombre es inválido', async () => {
    await expect(createCategory({ nombre: 'ab' })).rejects.toThrow()
    expect(post).not.toHaveBeenCalled()
  })

  it('rechaza si la respuesta no cumple categorySchema', async () => {
    post.mockResolvedValue({ data: { id: 'x', nombre: 'Bebidas' } })

    await expect(createCategory({ nombre: 'Bebidas' })).rejects.toThrow()
  })
})
