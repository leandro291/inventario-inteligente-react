import { cn } from '@/lib/utils'

export type ChatMessage = {
  id: string
  author: 'user' | 'assistant'
  text: string
}

type ChatMessagesProps = {
  messages: ChatMessage[]
  isPending: boolean
}

type BubbleProps = Pick<ChatMessage, 'author' | 'text'>

function Bubble({ author, text }: BubbleProps) {
  const isUser = author === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug whitespace-pre-line',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm border bg-card text-foreground',
        )}
      >
        {text}
      </div>
    </div>
  )
}

export function ChatMessages({ messages, isPending }: ChatMessagesProps) {
  return (
    <div
      role="log"
      aria-live="polite"
      className="flex flex-1 flex-col gap-3.5 overflow-y-auto bg-background p-5"
    >
      {messages.map((message) => (
        <Bubble key={message.id} author={message.author} text={message.text} />
      ))}
      {isPending && <Bubble author="assistant" text="Pensando…" />}
    </div>
  )
}
