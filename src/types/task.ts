export type Category = "робота" | "навчання" | "особисте" | "здоров'я" | "побут" | "інше";
export type Priority = "висока" | "середня" | "низька";
export type TaskStatus = "inbox" | "today" | "done";

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  estimate_min: number;
  deadline: string | null;
  status: TaskStatus;
  created_at: string;
}

export const CATEGORIES: Category[] = ["робота", "навчання", "особисте", "здоров'я", "побут", "інше"];
export const PRIORITIES: Priority[] = ["висока", "середня", "низька"];
