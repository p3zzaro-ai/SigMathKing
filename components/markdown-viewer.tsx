// components/markdown-viewer.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' // WAJIB: CSS untuk rumus matematika

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-a:text-blue-600 prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            // Custom styling jika perlu
            p: ({children}) => <p className="mb-4 leading-relaxed text-slate-700">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}