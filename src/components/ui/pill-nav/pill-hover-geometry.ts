export type PillHoverGeometry = {
  diameter: number;
  delta: number;
  originY: number;
  targetScale: number;
};

/**
 * Circle hover geometry for pill nav items.
 * targetScale adapts for narrow pills (e.g. EN/ES) so the fill covers the full pill.
 */
export function computePillHoverGeometry(width: number, height: number): PillHoverGeometry {
  const R = ((width * width) / 4 + height * height) / (2 * height);
  const diameter = Math.ceil(2 * R) + 2;
  const delta =
    Math.ceil(R - Math.sqrt(Math.max(0, R * R - (width * width) / 4))) + 1;
  const originY = diameter - delta;
  const cornerDist = Math.hypot(width / 2, height);
  const minScale = cornerDist / R;
  const targetScale = Math.max(1.2, minScale * 1.05);

  return { diameter, delta, originY, targetScale };
}
