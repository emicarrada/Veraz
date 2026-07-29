/** Word-wrap a headline for social cards; never truncates with ellipsis. */
export function wrapTitleLines(title: string, maxCharsPerLine: number): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

export type FitTitleLayoutInput = {
  title: string;
  isVertical: boolean;
  height: number;
  marginBottom: number;
  footerCaptionHeight: number;
  sourceRowHeight: number;
  contentGap: number;
};

export type FitTitleLayoutResult = {
  lines: string[];
  titleFontSize: number;
  titleLineHeight: number;
};

/** Wrap full title and shrink type until it fits the overlay safe area. */
export function fitTitleLayout(input: FitTitleLayoutInput): FitTitleLayoutResult {
  const {
    title,
    isVertical,
    height,
    marginBottom,
    footerCaptionHeight,
    sourceRowHeight,
    contentGap,
  } = input;

  const baseCharsPerLine = isVertical ? 22 : 26;
  const minFontSize = isVertical ? 38 : 34;
  const maxTitleTop = isVertical ? 180 : 240;

  const contentBottom = marginBottom + footerCaptionHeight;
  const sourceY = height - contentBottom - sourceRowHeight;
  const maxTitleBlockHeight = Math.max(sourceY - contentGap - maxTitleTop, 120);

  let titleFontSize = isVertical ? 56 : 54;
  let charsPerLine = baseCharsPerLine;
  let lines = wrapTitleLines(title, charsPerLine);
  let titleLineHeight = titleFontSize * 1.12;
  let titleBlockHeight = lines.length * titleLineHeight;

  while (titleBlockHeight > maxTitleBlockHeight && titleFontSize > minFontSize) {
    titleFontSize -= 2;
    titleLineHeight = titleFontSize * 1.12;
    titleBlockHeight = lines.length * titleLineHeight;
  }

  while (titleBlockHeight > maxTitleBlockHeight && charsPerLine < 42) {
    charsPerLine += 2;
    lines = wrapTitleLines(title, charsPerLine);
    titleBlockHeight = lines.length * titleLineHeight;
  }

  while (titleBlockHeight > maxTitleBlockHeight && titleFontSize > minFontSize) {
    titleFontSize -= 2;
    titleLineHeight = titleFontSize * 1.12;
    titleBlockHeight = lines.length * titleLineHeight;
  }

  return { lines, titleFontSize, titleLineHeight };
}
