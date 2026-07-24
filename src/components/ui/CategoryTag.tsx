import type { Category } from "@/types/task";
import { CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const CATEGORY_STYLE: Record<Category, string> = {
  робота: "bg-category-robota/15 text-category-robota",
  навчання: "bg-category-navchannia/15 text-category-navchannia",
  особисте: "bg-category-osobyste/15 text-category-osobyste",
  "здоров'я": "bg-category-zdorovia/15 text-category-zdorovia",
  побут: "bg-category-pobut/15 text-category-pobut",
  інше: "bg-category-inshe/15 text-category-inshe",
};

export function CategoryTag({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        CATEGORY_STYLE[category],
        className
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
