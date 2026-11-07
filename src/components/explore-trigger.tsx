"use client";

/**
 * Aristide-Benoist-style minimal explore trigger: a word, a hairline stem and
 * a plus sign — no surface, no pill. Hover shrinks the underline, lifts the
 * stem away and turns the plus into an orange arrow.
 */
type ExploreTriggerProps = {
  /** When set, renders an <a> that opens a new tab; otherwise a <button>. */
  url?: string;
  label: string;
  /** "stack" is the classic vertical EXPLORE; "row" lays label + plus inline. */
  variant?: "stack" | "row";
  /** Tiny absolute-positioned captions flanking the trigger. */
  metaLeft?: string;
  metaRight?: string;
  /** Click handler used only when `url` is absent. */
  onActivate?: () => void;
  tabIndex?: number;
  className?: string;
};

export default function ExploreTrigger({
  url,
  label,
  variant = "stack",
  metaLeft,
  metaRight,
  onActivate,
  tabIndex,
  className = "",
}: ExploreTriggerProps) {
  const inner = (
    <>
      {metaLeft ? (
        <span className="explore-meta explore-meta-left" aria-hidden="true">
          {metaLeft}
        </span>
      ) : null}
      {metaRight ? (
        <span className="explore-meta explore-meta-right" aria-hidden="true">
          {metaRight}
        </span>
      ) : null}
      <span className="explore-label">{label}</span>
      <span className="explore-stem" aria-hidden="true" />
      <span className="explore-plus" aria-hidden="true">
        <span className="explore-plus-glyph">+</span>
        <span className="explore-play-glyph">▶</span>
      </span>
    </>
  );

  const cls =
    "explore-trigger" +
    (variant === "row" ? " explore-trigger--row" : "") +
    (className ? ` ${className}` : "");

  if (url) {
    return (
      <a className={cls} href={url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={onActivate}
      tabIndex={tabIndex}
    >
      {inner}
    </button>
  );
}
