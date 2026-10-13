import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import {
  deleteProduct,
  getProducts,
} from '@/modules/inventory/services/products.service'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), delete: vi.fn() } }))

const product = {
  id: 1,
  nombre: 'Mouse',
  precio: 1234.5,
  stock: 10,
  category_id: 2,
}

describe('products.service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getProducts pide /products/ y devuelve los productos parseados', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [product] })

    await expect(getProducts()).resolves.toEqual([product])
    expect(api.get).toHaveBeenCalledWith('/products/')
  })

  it('getProducts rechaza si precio no es number', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ ...product, precio: '1234.5' }],
    })

    await expect(getProducts()).rejects.toThrow()
  })

  it('deleteProduct llama DELETE /products/{id}', async () => {
    vi.mocked(api.delete).mockResolvedValue({ status: 204 })

    await deleteProduct(7)
    expect(api.delete).toHaveBeenCalledWith('/products/7')
  })
})
