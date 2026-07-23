"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Task } from "@/types/task";
import { loadTasks, saveTasks } from "@/lib/storage";

interface State {
  tasks: Task[];
  isHydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; tasks: Task[] }
  | { type: "ADD_TASKS"; tasks: Task[] }
  | { type: "UPDATE_TASK"; id: string; patch: Partial<Task> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "MOVE_TO_TODAY"; id: string }
  | { type: "COMPLETE_TASK"; id: string };

const INITIAL_STATE: State = { tasks: [], isHydrated: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { tasks: action.tasks, isHydrated: true };
    case "ADD_TASKS":
      return { ...state, tasks: [...state.tasks, ...action.tasks] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "MOVE_TO_TODAY":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, status: "today" } : t)),
      };
    case "COMPLETE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, status: "done" } : t)),
      };
    default:
      return state;
  }
}

interface TasksContextValue {
  tasks: Task[];
  isHydrated: boolean;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveToToday: (id: string) => void;
  completeTask: (id: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    dispatch({ type: "HYDRATE", tasks: loadTasks() });
  }, []);

  useEffect(() => {
    if (state.isHydrated) saveTasks(state.tasks);
  }, [state.tasks, state.isHydrated]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: state.tasks,
      isHydrated: state.isHydrated,
      addTasks: (newTasks) => dispatch({ type: "ADD_TASKS", tasks: newTasks }),
      updateTask: (id, patch) => dispatch({ type: "UPDATE_TASK", id, patch }),
      deleteTask: (id) => dispatch({ type: "DELETE_TASK", id }),
      moveToToday: (id) => dispatch({ type: "MOVE_TO_TODAY", id }),
      completeTask: (id) => dispatch({ type: "COMPLETE_TASK", id }),
    }),
    [state]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
