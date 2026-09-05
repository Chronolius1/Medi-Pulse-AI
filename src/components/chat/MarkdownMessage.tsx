import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders assistant output as markdown.
 *
 * This is the XSS fix. The original passed model output — and the user's own
 * text — through `innerHTML`, so any tag in either became live markup.
 * react-markdown builds a React tree instead, and raw HTML is NOT enabled
 * (no rehype-raw), so `<img onerror=...>` in a response renders as literal
 * text. The component map below also caps what elements can be produced at all.
 */
export function MarkdownMessage({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer nofollow">
            {children}
          </a>
        ),
        // Headings inside a chat bubble just add noise; flatten them.
        h1: ({ children }) => <p><strong>{children}</strong></p>,
        h2: ({ children }) => <p><strong>{children}</strong></p>,
        h3: ({ children }) => <p><strong>{children}</strong></p>,
        img: () => null,
        code: ({ children }) => (
          <code className="rounded bg-slate-800 px-1 py-0.5 text-[10.5px]">{children}</code>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}
