import { describe, expect, it } from 'vitest'
import { isLowStock, LOW_STOCK_THRESHOLD } from '@/lib/stock'

describe('isLowStock', () => {
  it('umbral es 10', () => {
    expect(LOW_STOCK_THRESHOLD).toBe(10)
  })
  it('10 es bajo, 11 no', () => {
    expect(isLowStock(10)).toBe(true)
    expect(isLowStock(11)).toBe(false)
    expect(isLowStock(0)).toBe(true)
  })
})
