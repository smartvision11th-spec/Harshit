/** Splits a string into word spans (for scrubbed word reveals). Each word carries data-word. */
export function Words({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} data-word className={`inline-block mr-[0.22em] ${className}`}>
          {word}
        </span>
      ))}
    </>
  );
}

/** Splits a string into words, each containing character spans (for staggered letter animation). */
export function Chars({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, wi) => (
        <span key={`${word}-${wi}`} className="mr-[0.24em] inline-block overflow-hidden whitespace-nowrap align-bottom">
          {word.split('').map((ch, ci) => (
            <span key={ci} data-char className={`inline-block ${className}`}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}
