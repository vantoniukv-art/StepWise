import type { Category } from "@/types/task";
import { cn } from "@/lib/utils";

const CATEGORY_STYLE: Record<Category, string> = {
  навчання: "bg-category-navchannia/15 text-category-navchannia",
  нетворкінг: "bg-category-networking/15 text-category-networking",
  портфоліо: "bg-category-portfolio/15 text-category-portfolio",
  пошук: "bg-category-poshuk/15 text-category-poshuk",
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
      {category}
    </span>
  );
}
