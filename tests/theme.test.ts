/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

function block(selector: string): string {
  const match = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))
  return match?.[1] ?? ''
}

function declared(body: string): Set<string> {
  return new Set([...body.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1] ?? ''))
}

function referenced(body: string): string[] {
  return [...body.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1] ?? '')
}

const theme = block('@theme inline')
const root = block(':root')

describe('tema', () => {
  test('cada var() de @theme inline está definida', () => {
    const defined = new Set([...declared(root), ...declared(theme)])
    const missing = referenced(theme).filter((name) => !defined.has(name))
    expect(missing).toEqual([])
  })

  test('registra los tokens propios del design system', () => {
    const names = declared(theme)
    for (const name of [
      '--color-warning',
      '--color-warning-foreground',
      '--color-warning-border',
      '--color-warning-strong',
      '--color-success',
      '--color-success-foreground',
      '--font-mono',
    ]) {
      expect(names.has(name), name).toBe(true)
    }
  })

  test('primary es el azul del canvas', () => {
    expect(root).toContain('--primary: oklch(0.533 0.221 265.8);')
  })

  test('no hay tema oscuro', () => {
    expect(css).not.toMatch(/\.dark\s*\{/)
  })
})
