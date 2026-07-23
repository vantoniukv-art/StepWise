"use client";

import { useState } from "react";
import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { TodayTaskItem } from "@/components/today/TodayTaskItem";
import { useTasks } from "@/store/TasksProvider";

export function TodayScreen({ onGoToInbox }: { onGoToInbox: () => void }) {
  const { tasks, completeTask } = useTasks();
  const [isCelebrating, setIsCelebrating] = useState(false);

  const todayTasks = tasks.filter((t) => t.status === "today" || t.status === "done");
  const doneCount = todayTasks.filter((t) => t.status === "done").length;
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;

  function handleComplete(id: string) {
    completeTask(id);
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 900);
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
      <header className="mb-5 flex items-start gap-3">
        <Glow state={isCelebrating ? "celebrating" : "idle"} size="lg" className="mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Сьогодні</h1>
          <p className="mt-1 text-sm text-muted">
            {todayTasks.length === 0
              ? "Тут з'явиться твій план на сьогодні."
              : allDone
                ? "Місію на сьогодні виконано 🎉"
                : `${doneCount}/${todayTasks.length} виконано`}
          </p>
        </div>
      </header>

      {todayTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-card-border bg-card/50 px-6 py-12 text-center">
          <p className="text-sm leading-relaxed text-muted">
            Ще нічого не заплановано на сьогодні. Перенеси задачі з Inbox.
          </p>
          <Button onClick={onGoToInbox}>До Inbox</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <TodayTaskItem key={task.id} task={task} onComplete={() => handleComplete(task.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
