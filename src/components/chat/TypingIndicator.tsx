/** Three bouncing dots. Ported from `appendTypingIndicator` (med.js:1671-1691). */
export function TypingIndicator() {
  return (
    <div className="chat-bubble-ai flex w-fit items-center gap-1 px-3 py-2.5">
      <span className="sr-only">Assistant is typing</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-slate-500 motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
          aria-hidden
        />
      ))}
    </div>
  );
}
