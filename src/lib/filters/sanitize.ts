export function sanitizeNonNegativeInt(value: number | null): number | null {
  if (value == null) return null;
  if (!Number.isFinite(value)) return null;
  if (value < 0) return null;
  return value;
}

