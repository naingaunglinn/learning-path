export function parseList(s: string): string[] {
  return s.split(",").map((p) => p.trim()).filter(Boolean);
}

export function joinList(items: string[]): string {
  return items.join(", ");
}

export function parseLines(s: string): string[] {
  return s.split("\n").map((p) => p.trim()).filter(Boolean);
}

export function joinLines(items: string[]): string {
  return items.join("\n");
}
