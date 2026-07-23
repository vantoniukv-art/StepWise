"use client";

import { Check } from "lucide-react";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TodayTaskItemProps {
  task: Task;
  onComplete: () => void;
}

export function TodayTaskItem({ task, onComplete }: TodayTaskItemProps) {
  const isDone = task.status === "done";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
        isDone ? "border-priority-low/25 bg-priority-low/[0.04]" : "border-card-border bg-card"
      )}
    >
      <button
        type="button"
        onClick={() => !isDone && onComplete()}
        disabled={isDone}
        aria-label={isDone ? "Виконано" : "Позначити виконаним"}
        className={cn(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isDone ? "border-priority-low bg-priority-low" : "border-card-border hover:border-accent"
        )}
      >
        {isDone && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <CategoryTag category={task.category} />
          <PriorityBadge priority={task.priority} />
        </div>
        <p className={cn("text-sm font-medium leading-snug", isDone && "text-muted line-through decoration-1")}>
          {task.title}
        </p>
        <p className="mt-1 text-xs text-muted">{task.estimate_min} хв</p>
      </div>
    </div>
  );
}
