import { useEffect, useRef, useState } from "react";

// Animates a number counting up from 0 to target value
export function CountUp({ value, duration = 700, decimals = 0, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const target = typeof value === "number" ? value : parseFloat(value) || 0;
    fromRef.current = display;
    startRef.current = null;

    let frameId;
    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (target - fromRef.current) * eased;
      setDisplay(current);
      if (progress < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    // translate="no" / notranslate stops Google Translate from mutating this
    // node's DOM while it's mid-animation — without this, Google's rewrite
    // and React's own rapid re-renders here fight over the same text node,
    // React throws, and the count-up animation silently freezes at 0.
    <span className="notranslate" translate="no">
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
}

// Skeleton block — pass width/height
export function Skeleton({ width = "100%", height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

// Skeleton table rows
export function SkeletonRows({ rows = 3, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c} style={{ padding: "12px 14px" }}>
              <Skeleton height={14} width={c === 0 ? "80%" : "60%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Skeleton stat cards
export function SkeletonStatCard({ style = {}, className = "" }) {
  return (
    <div className={className} style={{ ...style }}>
      <Skeleton width="60%" height={11} style={{ marginBottom: 12 }} />
      <Skeleton width="40%" height={26} />
    </div>
  );
}

// Wraps a card with entrance animation + hover lift, with optional stagger index
export function AnimatedCard({ children, index = 0, style = {}, className = "" }) {
  const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
  return (
    <div className={`anim-card hover-lift ${staggerClass} ${className}`} style={style}>
      {children}
    </div>
  );
}

// Wraps a table row with entrance animation, with optional stagger index
export function AnimatedRow({ children, index = 0 }) {
  const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
  return <tr className={`anim-row ${staggerClass}`}>{children}</tr>;
}