// Markdown renderer for AI chat responses
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content, className = "" }) {
  return (
    <div className={`markdown-content text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Prevent heading rendering in chat bubbles (too large)
          h1: ({ children }) => <p className="font-bold text-white mb-1">{children}</p>,
          h2: ({ children }) => <p className="font-bold text-white mb-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold text-gray-200 mb-1">{children}</p>,
          // Clean links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
              {children}
            </a>
          ),
          // Compact lists
          ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-2">{children}</ol>,
          // Paragraphs
          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
          // Strong
          strong: ({ children }) => <strong className="text-orange-300 font-semibold">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
