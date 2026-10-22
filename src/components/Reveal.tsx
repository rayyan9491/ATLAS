import React, { useEffect, useState } from "react";

/* Flips to true one frame after mount so the CSS transition actually plays. */
function useMounted() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, []);
  return on;
}

/* Whole block fades + slides in together (nav, badge, form, footer). */
type RevealProps = {
  delay: number;            // ms after load
  from?: string;            // start offset, e.g. "1.25rem" or "-0.75rem"
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ delay, from = "1.25rem", as: Tag = "div", className = "", children }: RevealProps) {
  const on = useMounted();
  return (
    <Tag
      className={`fs-reveal ${on ? "is-in" : ""} ${className}`.trim()}
      style={{ "--delay": `${delay}ms`, "--from": from } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* Word-by-word reveal (heading + sub-line). easeOutCubic = cubic-bezier(.215,.61,.355,1) */
type WordsProps = {
  text: string;
  baseDelay: number;   // ms
  stagger: number;     // ms between words
  duration: number;    // ms per word
  fromY: number;       // px
};

export function RevealWords({ text, baseDelay, stagger, duration, fromY }: WordsProps) {
  const on = useMounted();
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span
            className="fs-word"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? "none" : `translateY(${fromY}px)`,
              transition: `opacity ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) ${baseDelay + i * stagger}ms, transform ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) ${baseDelay + i * stagger}ms`,
            }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </>
  );
}
