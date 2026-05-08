import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PropTypes from 'prop-types'

const components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 text-[0.9375rem] leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-[#eeeef5]">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 last:mb-0 ml-4 list-disc space-y-1 text-[0.9375rem] text-slate-700 dark:text-[#c8c8e0]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 last:mb-0 ml-4 list-decimal space-y-1 text-[0.9375rem] text-slate-700 dark:text-[#c8c8e0]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-3 first:mt-0 text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1 mt-2 first:mt-0 text-sm font-semibold text-slate-800 dark:text-[#dddde8]">{children}</h4>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-indigo-600 dark:bg-[#1c1c25] dark:text-indigo-400">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 last:mb-0 border-l-2 border-indigo-300 pl-3 text-slate-500 italic dark:border-indigo-700 dark:text-[#9898b0]">{children}</blockquote>
  ),
  hr: () => (
    <hr className="my-3 border-slate-200 dark:border-[#252530]" />
  ),
}

export default function AiMessageContent({ text }) {
  if (!text) return null
  // Defensively strip [Q]/[R] prefix if backend didn't strip it
  const sanitized = text.replace(/^\[(?:Q|R)\]\s*/, '')
  return (
    <div className="ai-prose">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {sanitized}
      </Markdown>
    </div>
  )
}

AiMessageContent.propTypes = {
  text: PropTypes.string,
}
