import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SUGGESTIONS = [
  'Valor total del inventario',
  '¿Qué categoría tiene más stock?',
  'Productos con stock bajo',
]

const MIN_LENGTH = 3
const MAX_LENGTH = 500

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  isPending: boolean
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  isPending,
}: ChatComposerProps) {
  const isSendDisabled = isPending || value.trim().length < MIN_LENGTH

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSendDisabled) return
    onSend(value)
  }

  return (
    <div className="flex flex-col gap-3 px-5 pt-3 pb-5">
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={isPending}
            onClick={() => onSend(suggestion)}
            className="min-h-11 rounded-full bg-accent px-4 text-sm text-accent-foreground transition-colors hover:bg-accent/80 disabled:pointer-events-none disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex flex-1 flex-col">
          <Label htmlFor="chat-message" className="sr-only">
            Mensaje
          </Label>
          <Input
            id="chat-message"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Escribí tu pregunta…"
            maxLength={MAX_LENGTH}
            className="h-11 rounded-lg"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="size-11"
          aria-label="Enviar"
          disabled={isSendDisabled}
        >
          <Send aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
