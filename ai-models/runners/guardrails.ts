export function ensureEvidence<T extends { evidence?: string[] }>(items: T[]) {
  return items.filter((item) => Array.isArray(item.evidence) && item.evidence.length > 0);
}

export function ensurePoiReferences(mentioned: string[], allowed: Set<string>) {
  return mentioned.filter((id) => allowed.has(id));
}
