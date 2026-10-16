export function matchesSearch(query: string, values: unknown[]) {
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  if (!normalizedQuery) return true;

  return values.some((value) =>
    String(value ?? "").toLocaleLowerCase("id-ID").includes(normalizedQuery),
  );
}