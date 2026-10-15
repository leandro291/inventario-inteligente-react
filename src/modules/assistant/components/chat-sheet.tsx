import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ChatComposer } from '@/modules/assistant/components/chat-composer'
import {
  ChatMessages,
  type ChatMessage,
} from '@/modules/assistant/components/chat-messages'
import { useAsk } from '@/modules/assistant/hooks/use-ask'

const GREETING: ChatMessage = {
  id: 'greeting',
  author: 'assistant',
  text: 'Hola, soy tu asistente. Puedo consultar productos, categorías y stock.',
}

// El estado vive fuera de SheetContent: cerrar y reabrir el panel conserva todo
export function ChatSheet() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [draft, setDraft] = useState('')
  const [threadId] = useState(() => crypto.randomUUID())
  const { mutate, isPending, errorMessage } = useAsk()

  function addMessage(author: ChatMessage['author'], text: string) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), author, text }])
  }

  function handleSend(text: string) {
    const pregunta = text.trim()
    addMessage('user', pregunta)
    setDraft('')
    mutate(
      { pregunta, thread_id: threadId },
      {
        onSuccess: ({ respuesta }) => addMessage('assistant', respuesta),
        onError: () => setDraft(pregunta),
      },
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="h-11 w-full">
          <Sparkles aria-hidden="true" />
          Chat IA
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]"
      >
        <div className="flex items-start justify-between gap-2 border-b px-5 py-3">
          <div className="flex flex-col gap-0.5">
            <SheetTitle>Asistente de inventario</SheetTitle>
            <SheetDescription>
              Preguntá sobre productos y stock
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Cerrar chat"
            >
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </div>
        <ChatMessages messages={messages} isPending={isPending} />
        {errorMessage && (
          <p
            role="alert"
            className="mx-5 mb-1 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        )}
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          isPending={isPending}
        />
      </SheetContent>
    </Sheet>
  )
}
