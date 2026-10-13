import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { getCategories } from '@/modules/inventory/services/categories.service'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn() } }))

const get = vi.mocked(api.get)

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
