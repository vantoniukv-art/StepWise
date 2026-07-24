import type { Category, Priority } from "@/types/task";

/**
 * Display labels only — the underlying schema values (Category/Priority
 * union types, the Zod enum in the API route, and the system prompt) stay
 * untouched. Keeping this as a separate presentation-layer map means the
 * AI contract never has to change just because the UI copy does.
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  робота: "Робота",
  навчання: "Навчання",
  особисте: "Особисте",
  "здоров'я": "Здоров'я",
  побут: "Побут",
  інше: "Різне",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  висока: "Важливо",
  середня: "Середньо",
  низька: "Не горить",
};
