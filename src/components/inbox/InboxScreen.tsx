"use client";

import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { InboxTaskCard } from "@/components/inbox/InboxTaskCard";
import { buildExampleTasks } from "@/lib/exampleTasks";
import { useTasks } from "@/store/TasksProvider";
import type { Task } from "@/types/task";

export function InboxScreen({ onGoToBrainDump }: { onGoToBrainDump: () => void }) {
  const { tasks, addTasks, updateTask, deleteTask, moveToToday } = useTasks();
  const inboxTasks = tasks.filter((t) => t.status === "inbox");
  const inboxIds = new Set(inboxTasks.map((t) => t.id));
  const topLevelTasks = inboxTasks.filter((t) => !t.parent_id || !inboxIds.has(t.parent_id));

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
        {inboxTasks.length > 0 && (
          <p className="mt-1 text-sm text-muted">Ось твої наступні кроки. Обери, з чого почнеш сьогодні</p>
        )}
      </header>

      {topLevelTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-card-border bg-card/50 px-6 py-12 text-center">
          <Glow size="lg" />
          <p className="text-sm leading-relaxed text-muted">
            Поки що тут порожньо. Напиши свої думки, і Glow перетворить їх на задачі
          </p>
          <div className="flex w-full flex-col gap-2">
            <Button onClick={onGoToBrainDump} className="w-full">
              До Думок
            </Button>
            <Button variant="secondary" onClick={() => addTasks(buildExampleTasks())} className="w-full">
              Показати приклад
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelTasks.map((task) => {
            const children = inboxTasks.filter((t) => t.parent_id === task.id);
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
        </div>
      )}
    </div>
  );
}
