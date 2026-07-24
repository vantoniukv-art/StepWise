import type { Task } from "@/types/task";

const STORAGE_KEY = "stepwise_planner_tasks_v1";
const DEMO_PURGE_KEY = "stepwise_planner_demo_purge_v1";

// One-time cleanup for the removed "Показати приклад" demo-seed feature —
// deletes any leftover demo tasks (by exact title match) from earlier sessions.
const DEMO_TITLES = new Set([
  "Оновити розділ досвіду в резюме",
  "Написати Марині щодо менторства",
  "Пройти 3-й модуль курсу з SQL",
  "Зібрати два кейси для портфоліо",
  "Відповісти рекрутеру з LinkedIn",
  "Почитати про продуктові метрики",
  "Записатись до стоматолога",
  "Купити подарунок мамі на день народження",
  "Розібрати шафу і віддати зайве",
]);

function purgeDemoTasksOnce(tasks: Task[]): Task[] {
  if (window.localStorage.getItem(DEMO_PURGE_KEY) === "true") return tasks;

  const removedIds = new Set(tasks.filter((t) => DEMO_TITLES.has(t.title)).map((t) => t.id));
  const purged = tasks.filter((t) => !removedIds.has(t.id) && !(t.parent_id && removedIds.has(t.parent_id)));

  window.localStorage.setItem(DEMO_PURGE_KEY, "true");
  if (purged.length !== tasks.length) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(purged));
  }
  return purged;
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.map((t) => ({ ...t, parent_id: t.parent_id ?? null }));
    return purgeDemoTasksOnce(migrated);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage unavailable — tasks simply won't persist across reloads
  }
}
