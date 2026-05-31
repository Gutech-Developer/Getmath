"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

interface IMathTextProps {
  text: string;
  className?: string;
  displayMode?: boolean;
}

/**
 * Renders a plain-text string that may contain $...$ inline math notation.
 * Each $latex$ segment is rendered as KaTeX; everything else is plain text.
 */
export default function MathText({
  text,
  className,
  displayMode = false,
}: IMathTextProps) {
  if (!text) return null;
  // Split on $...$ patterns (non-greedy, no newlines inside)
  const parts = text.split(/(\$[^$\n]+\$)/g);

  return (
    <span className={className} style={{ whiteSpace: "pre-line" }}>
      {parts.map((part, i) => {
        if (/^\$[^$\n]+\$$/.test(part)) {
          const latex = part.slice(1, -1);
          try {
            const html = katex.renderToString(latex, {
              throwOnError: true,
              displayMode,
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            // fallback: show original text
            return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
          }
        }
        // Preserve newlines: split by \n and join with <br />
        return (
          <span key={i}>
            {part.split("\n").map((line, j, arr) => (
              <span key={j}>
                <span dangerouslySetInnerHTML={{ __html: line }} />
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
