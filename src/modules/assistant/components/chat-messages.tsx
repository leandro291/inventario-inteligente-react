import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

// Sin rehype-raw: el HTML crudo se muestra como texto y react-markdown
// descarta hrefs peligrosos (javascript:) con su urlTransform por defecto.
const markdownComponents: Components = {
  p: ({ node: _node, ...props }) => <p {...props} />,
  h1: ({ node: _node, ...props }) => <p className="font-semibold" {...props} />,
  h2: ({ node: _node, ...props }) => <p className="font-semibold" {...props} />,
  h3: ({ node: _node, ...props }) => <p className="font-semibold" {...props} />,
  ul: ({ node: _node, ...props }) => (
    <ul className="list-disc pl-5" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="list-decimal pl-5" {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a
      className="text-primary underline"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: ({ node: _node, ...props }) => (
    <code className="rounded bg-muted px-1 font-mono" {...props} />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre className="overflow-x-auto rounded-md bg-muted p-2" {...props} />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th
      className="border px-2 py-1 text-left font-medium text-muted-foreground"
      {...props}
    />
  ),
  td: ({ node: _node, ...props }) => (
    <td className="border px-2 py-1" {...props} />
  ),
}

function Bubble({ author, text }: BubbleProps) {
  const isUser = author === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-snug',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground whitespace-pre-line'
            : 'flex flex-col gap-2 rounded-bl-sm border bg-card text-foreground',
        )}
      >
        {isUser ? (
          text
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {text}
          </ReactMarkdown>
        )}
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
