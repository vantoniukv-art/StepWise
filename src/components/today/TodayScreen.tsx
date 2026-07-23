"use client";

import { useState } from "react";
import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { TodayTaskItem } from "@/components/today/TodayTaskItem";
import { pickRandom } from "@/lib/random";
import { useTasks } from "@/store/TasksProvider";

const COMPLETION_PHRASES = ["Є! Один крок ближче", "Красиво зроблено", "Так тримати"];

export function TodayScreen({ onGoToInbox }: { onGoToInbox: () => void }) {
  const { tasks, completeTask } = useTasks();
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const todayTasks = tasks.filter((t) => t.status === "today" || t.status === "done");
  const doneCount = todayTasks.filter((t) => t.status === "done").length;
  const remainingCount = todayTasks.length - doneCount;
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;

  function handleComplete(id: string) {
    const willAllBeDone = todayTasks.every((t) => t.id === id || t.status === "done");
    completeTask(id);

    if (!willAllBeDone) {
      const phrase = pickRandom(COMPLETION_PHRASES);
      setFlashMessage(phrase);
      setTimeout(() => setFlashMessage(null), 1400);
    }

    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 900);
  }

  const subtitle = allDone
    ? "Місію на сьогодні виконано. Пишаюсь тобою!"
    : flashMessage
      ? flashMessage
      : `${remainingCount} задач у фокусі`;

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
      <header className="mb-5 flex items-start gap-3">
        <Glow state={isCelebrating ? "celebrating" : "neutral"} size="lg" className="mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Місія на сьогодні</h1>
          {todayTasks.length > 0 && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
      </header>

      {todayTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-card-border bg-card/50 px-6 py-12 text-center">
          <p className="text-sm leading-relaxed text-muted">
            На сьогодні поки нічого нема. Обери задачі в Розборі, і почнемо
          </p>
          <Button onClick={onGoToInbox}>До Розбору</Button>
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
