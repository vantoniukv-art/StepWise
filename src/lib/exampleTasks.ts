import { generateId } from "@/lib/id";
import type { Task } from "@/types/task";

function upcomingFridayISO(): string {
  const now = new Date();
  const diff = (5 - now.getDay() + 7) % 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + diff);
  return friday.toISOString().slice(0, 10);
}

interface ExampleTaskSeed {
  title: string;
  category: Task["category"];
  priority: Task["priority"];
  estimate_min: number;
  deadline: string | null;
}

const EXAMPLE_SEEDS: ExampleTaskSeed[] = [
  { title: "Оновити розділ досвіду в резюме", category: "пошук", priority: "висока", estimate_min: 45, deadline: null },
  { title: "Написати Марині щодо менторства", category: "нетворкінг", priority: "середня", estimate_min: 15, deadline: null },
  { title: "Пройти 3-й модуль курсу з SQL", category: "навчання", priority: "висока", estimate_min: 60, deadline: "__friday__" },
  { title: "Зібрати два кейси для портфоліо", category: "портфоліо", priority: "середня", estimate_min: 90, deadline: null },
  { title: "Відповісти рекрутеру з LinkedIn", category: "пошук", priority: "висока", estimate_min: 10, deadline: null },
  { title: "Почитати про продуктові метрики", category: "навчання", priority: "низька", estimate_min: 30, deadline: null },
];

export function buildExampleTasks(): Task[] {
  const now = new Date().toISOString();
  const friday = upcomingFridayISO();

  return EXAMPLE_SEEDS.map((seed) => ({
    id: generateId("task"),
    title: seed.title,
    category: seed.category,
    priority: seed.priority,
    estimate_min: seed.estimate_min,
    deadline: seed.deadline === "__friday__" ? friday : seed.deadline,
    status: "inbox" as const,
    created_at: now,
  }));
}
