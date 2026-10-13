import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProductPreview } from '@/modules/inventory/components/product-preview'

describe('ProductPreview', () => {
  it('muestra placeholders con todo vacío', () => {
    render(
      <ProductPreview nombre="" categoria={undefined} precio={0} stock={0} />,
    )

    expect(screen.getByText('Vista previa')).toBeInTheDocument()
    expect(screen.getByText('Nombre del producto')).toBeInTheDocument()
    expect(screen.getByText('Sin categoría')).toBeInTheDocument()
    expect(screen.getByText('$0,00')).toBeInTheDocument()
  })

  it('muestra nombre, categoría y valor en stock (precio × stock)', () => {
    render(
      <ProductPreview
        nombre="Café molido"
        categoria="Bebidas"
        precio={2.5}
        stock={5}
      />,
    )

    expect(screen.getByText('Café molido')).toBeInTheDocument()
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.getByText('$12,50')).toBeInTheDocument()
  })

  it('trata NaN como 0 en el valor en stock', () => {
    render(
      <ProductPreview
        nombre="   "
        categoria="  "
        precio={Number.NaN}
        stock={Number.NaN}
      />,
    )

    expect(screen.getByText('Nombre del producto')).toBeInTheDocument()
    expect(screen.getByText('Sin categoría')).toBeInTheDocument()
    expect(screen.getByText('$0,00')).toBeInTheDocument()
  })
})
