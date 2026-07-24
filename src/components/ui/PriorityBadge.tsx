import type { Priority } from "@/types/task";
import { PRIORITY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const PRIORITY_DOT: Record<Priority, string> = {
  висока: "bg-priority-high",
  середня: "bg-priority-medium",
  низька: "bg-priority-low",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-muted", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
