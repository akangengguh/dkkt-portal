import { Temporal } from "temporal-polyfill/full";

export function toInstant(value: unknown): Temporal.Instant | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;

  let input = value instanceof Date ? value.toISOString() : value.trim();
  if (!input) return null;

  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(input)) {
    input = input.includes("T")
      ? `${input.length === 16 ? `${input}:00` : input}+07:00`
      : `${input}T00:00:00+07:00`;
  }

  try {
    return Temporal.Instant.from(input);
  } catch {
    return null;
  }
}

export function nowInstant() {
  return Temporal.Now.instant();
}