import { describe, expect, it } from 'vitest'
import { formatMoney } from '@/lib/format'

describe('formatMoney', () => {
  it('formatea en es-AR con 2 decimales', () => {
    expect(formatMoney(1234.5)).toBe('$1.234,50')
    expect(formatMoney(0)).toBe('$0,00')
  })
})
