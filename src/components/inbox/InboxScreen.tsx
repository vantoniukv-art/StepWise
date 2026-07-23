"use client";

import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { InboxTaskCard } from "@/components/inbox/InboxTaskCard";
import { useTasks } from "@/store/TasksProvider";
import type { Task } from "@/types/task";

export function InboxScreen({ onGoToBrainDump }: { onGoToBrainDump: () => void }) {
  const { tasks, updateTask, deleteTask, moveToToday } = useTasks();
  const inboxTasks = tasks.filter((t) => t.status === "inbox");

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <p className="mt-1 text-sm text-muted">
          {inboxTasks.length > 0
            ? "Розібрала! Ось твої задачі — додай потрібні на сьогодні."
            : "Тут з'являться задачі після розбору."}
        </p>
      </header>

      {inboxTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-card-border bg-card/50 px-6 py-12 text-center">
          <Glow size="lg" />
          <p className="text-sm leading-relaxed text-muted">
            Порожньо. Вивантаж думки на першому екрані — я розберу їх на задачі.
          </p>
          <Button onClick={onGoToBrainDump}>Вивантажити думки</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxTasks.map((task: Task) => (
            <InboxTaskCard
              key={task.id}
              task={task}
              onUpdate={(patch) => updateTask(task.id, patch)}
              onDelete={() => deleteTask(task.id)}
              onMoveToToday={() => moveToToday(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
