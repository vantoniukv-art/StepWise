"use client";

import { useState } from "react";
import { useTasks } from "@/store/TasksProvider";
import type { Task } from "@/types/task";

const ERROR_MESSAGE = "Ой, щось збилось. Спробуй ще раз";

export function useDecomposeTask() {
  const { addTasks } = useTasks();
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function decompose(task: Task) {
    if (isDecomposing) return;
    setIsDecomposing(true);

    try {
      const res = await fetch("/api/decompose-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: task.id, title: task.title }),
      });

      if (!res.ok) throw new Error("decompose failed");

      const data = await res.json();
      const steps: Task[] = data.tasks ?? [];
      if (steps.length === 0) throw new Error("no steps returned");

      addTasks(steps);
    } catch {
      setToast(ERROR_MESSAGE);
      setTimeout(() => setToast(null), 2500);
    } finally {
      setIsDecomposing(false);
    }
  }

  return { decompose, isDecomposing, toast };
}
