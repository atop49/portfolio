/**
 * YouSheBiaoTiHei is wide and heavy. Two or three characters stay on one
 * line; longer titles are split into a balanced two-line block. The same split
 * is used by the card and the inspector so the FLIP handoff keeps its shape.
 * Titles that contain a space (e.g. "Markdown 笔记") break at the space so
 * latin words are never cut in half.
 */
export function splitDisplayTitle(title: string): string[] {
  const chars = Array.from(title);
  if (chars.length <= 3) return [title];

  const spaceIndex = chars.findIndex((char) => char === " ");
  if (spaceIndex > 0 && spaceIndex < chars.length - 1) {
    return [
      chars.slice(0, spaceIndex).join("").trimEnd(),
      chars.slice(spaceIndex + 1).join("").trimStart(),
    ];
  }

  const middle = Math.floor(chars.length / 2);
  return [chars.slice(0, middle).join(""), chars.slice(middle).join("")];
}
