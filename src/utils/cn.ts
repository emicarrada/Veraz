/**
 * Lightweight className composer.
 * Avoids extra dependencies while keeping call sites readable.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}
