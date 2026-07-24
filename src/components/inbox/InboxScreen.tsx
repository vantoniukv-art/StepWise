"use client";

import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { InboxTaskCard } from "@/components/inbox/InboxTaskCard";
import { useTasks } from "@/store/TasksProvider";
import type { Task } from "@/types/task";

export function InboxScreen({ onGoToBrainDump }: { onGoToBrainDump: () => void }) {
  const { tasks, updateTask, deleteTask, moveToToday } = useTasks();
  const inboxTasks = tasks.filter((t) => t.status === "inbox");

  const topLevel = inboxTasks.filter((t) => !t.parent_id);
  const topLevelIds = new Set(topLevel.map((t) => t.id));

  // Steps still in Inbox, grouped by their parent's id.
  const childrenByParent = new Map<string, Task[]>();
  for (const t of inboxTasks) {
    if (!t.parent_id) continue;
    const list = childrenByParent.get(t.parent_id) ?? [];
    list.push(t);
    childrenByParent.set(t.parent_id, list);
  }

  // A parent can live outside Inbox (e.g. it was decomposed after already
  // being taken to Today) while its steps still land in Inbox — pull those
  // parents in from the full task list so the steps stay visually grouped.
  const externalParents = [...childrenByParent.keys()]
    .filter((id) => !topLevelIds.has(id))
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));

  const groups = [...topLevel, ...externalParents];

  // Steps whose parent was deleted entirely — nothing to nest them under.
  const knownParentIds = new Set(groups.map((g) => g.id));
  const danglingSteps = inboxTasks.filter((t) => t.parent_id && !knownParentIds.has(t.parent_id));

  const isEmpty = groups.length === 0 && danglingSteps.length === 0;

  function childCountOf(taskId: string) {
    return tasks.filter((t) => t.parent_id === taskId).length;
  }

  function renderCard(task: Task) {
    return (
      <InboxTaskCard
        key={task.id}
        task={task}
        childCount={childCountOf(task.id)}
        onUpdate={(patch) => updateTask(task.id, patch)}
        onDelete={() => deleteTask(task.id)}
        onMoveToToday={() => moveToToday(task.id)}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-semibold">Ось що вийшло</h1>
        {!isEmpty && (
          <p className="mt-1 text-sm text-muted">Ось твої наступні кроки. Обери, з чого почнеш сьогодні</p>
        )}
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-card-border bg-card/50 px-6 py-12 text-center">
          <Glow size="lg" />
          <p className="text-sm leading-relaxed text-muted">
            Поки що тут порожньо. Напиши свої думки, і Glow перетворить їх на задачі
          </p>
          <Button onClick={onGoToBrainDump} className="w-full">
            До Думок
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((task) => {
            const children = childrenByParent.get(task.id) ?? [];
            return (
              <div key={task.id}>
                {renderCard(task)}
                {children.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-card-border pl-4">
                    {children.map((child) => renderCard(child))}
                  </div>
                )}
              </div>
            );
          })}
          {danglingSteps.map((task) => renderCard(task))}
        </div>
      )}
    </div>
  );
}
