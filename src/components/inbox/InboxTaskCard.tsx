"use client";

import { useState } from "react";
import { Calendar, Clock, Pencil, Trash2, X } from "lucide-react";
import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Toast } from "@/components/ui/Toast";
import { useDecomposeTask } from "@/hooks/useDecomposeTask";
import { formatDeadline } from "@/lib/date";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/lib/labels";
import { pluralizeUk } from "@/lib/pluralize";
import { CATEGORIES, PRIORITIES, type Task } from "@/types/task";

interface InboxTaskCardProps {
  task: Task;
  childCount: number;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onMoveToToday: () => void;
}

export function InboxTaskCard({ task, childCount, onUpdate, onDelete, onMoveToToday }: InboxTaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task);
  const { decompose, isDecomposing, toast } = useDecomposeTask();
  const isDecomposed = childCount > 0;
  const canDecompose = !task.parent_id && !isDecomposed;

  function startEdit() {
    setDraft(task);
    setIsEditing(true);
  }

  function saveEdit() {
    onUpdate({
      title: draft.title.trim() || task.title,
      category: draft.category,
      priority: draft.priority,
      estimate_min: Math.max(5, Number(draft.estimate_min) || task.estimate_min),
      deadline: draft.deadline || null,
    });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-card p-4">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-accent/60 focus:outline-none"
        />

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as Task["category"] })}
            className="rounded-lg border border-card-border bg-background px-2.5 py-2 text-xs focus:border-accent/60 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value as Task["priority"] })}
            className="rounded-lg border border-card-border bg-background px-2.5 py-2 text-xs focus:border-accent/60 focus:outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <input
            type="number"
            min={5}
            value={draft.estimate_min}
            onChange={(e) => setDraft({ ...draft, estimate_min: Number(e.target.value) })}
            className="rounded-lg border border-card-border bg-background px-2.5 py-2 text-xs focus:border-accent/60 focus:outline-none"
          />
          <input
            type="date"
            value={draft.deadline ?? ""}
            onChange={(e) => setDraft({ ...draft, deadline: e.target.value || null })}
            className="rounded-lg border border-card-border bg-background px-2.5 py-2 text-xs text-muted focus:border-accent/60 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button onClick={saveEdit} className="flex-1">
            Зберегти
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
            <X className="h-4 w-4" /> Скасувати
          </Button>
        </div>
      </div>
    );
  }

  const deadlineLabel = formatDeadline(task.deadline);

  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <CategoryTag category={task.category} />
        <PriorityBadge priority={task.priority} />
      </div>

      <h3 className="text-sm font-semibold leading-snug">{task.title}</h3>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {task.estimate_min} хв
        </span>
        {deadlineLabel && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {deadlineLabel}
          </span>
        )}
      </div>

      {isDecomposed && (
        <p className="mt-2 text-xs text-accent">
          Розкладено на {childCount} {pluralizeUk(childCount, "крок", "кроки", "кроків")}
        </p>
      )}

      <div className="mt-3.5">
        <Button onClick={onMoveToToday} disabled={isDecomposed} className="w-full">
          Беру на сьогодні
        </Button>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={startEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-card-border py-2 text-xs font-medium text-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" /> Змінити
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-card-border py-2 text-xs font-medium text-muted hover:text-priority-high"
          >
            <Trash2 className="h-3.5 w-3.5" /> Прибрати
          </button>
        </div>
        {canDecompose && (
          <button
            type="button"
            onClick={() => decompose(task)}
            disabled={isDecomposing}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-card-border py-2 text-xs font-medium text-muted hover:text-foreground disabled:opacity-70"
          >
            <Glow state={isDecomposing ? "thinking" : "neutral"} size="xs" />
            {isDecomposing ? "Glow думає..." : "Розкласти з Glow"}
          </button>
        )}
      </div>

      <Toast message={toast} />
    </div>
  );
}
