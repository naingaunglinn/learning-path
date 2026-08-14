/* Shared types + literal helpers for the syllabus content files. */

export type SyllabusItemKind = "video" | "reading" | "lab" | "quiz" | "app";
export type SyllabusItem = { title: string; kind?: SyllabusItemKind; minutes?: number };
export type SyllabusSection = { section?: string; items: SyllabusItem[] };

export const v = (title: string, minutes: number): SyllabusItem => ({ title, kind: "video", minutes });
export const r = (title: string, minutes: number): SyllabusItem => ({ title, kind: "reading", minutes });
export const q = (title: string, minutes: number): SyllabusItem => ({ title, kind: "quiz", minutes });
export const lab = (title: string, minutes: number): SyllabusItem => ({ title, kind: "lab", minutes });
export const app = (title: string, minutes: number): SyllabusItem => ({ title, kind: "app", minutes });

export const S = (section: string | undefined, items: SyllabusItem[]): SyllabusSection => ({
  section,
  items,
});
