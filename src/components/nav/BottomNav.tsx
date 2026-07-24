"use client";

import { Inbox, Lock, ListChecks, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "braindump" | "inbox" | "today" | "locked";

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  inboxCount: number;
  todayCount: number;
}

const LOCKED_HINT = "Аналіз, пасвеї та роадмеп уже в розробці";

export function BottomNav({ active, onChange, inboxCount, todayCount }: BottomNavProps) {
  const tabs: { id: NavTab; label: string; icon: typeof PenLine; count?: number; title?: string }[] = [
    { id: "braindump", label: "Думки", icon: PenLine },
    { id: "inbox", label: "Задачі", icon: Inbox, count: inboxCount },
    { id: "today", label: "Сьогодні", icon: ListChecks, count: todayCount },
    { id: "locked", label: "Скоро", icon: Lock, title: LOCKED_HINT },
  ];

  return (
    <nav className="flex flex-shrink-0 items-start justify-around border-t border-card-border bg-background/95 px-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            title={tab.title}
            aria-label={tab.title ? `${tab.label}: ${tab.title}` : undefined}
            className="relative flex w-16 flex-shrink-0 flex-col items-center gap-1 rounded-2xl px-1 py-1.5"
          >
            <span className="relative">
              <Icon className={cn("h-5 w-5", isActive ? "text-accent" : "text-muted")} strokeWidth={isActive ? 2.4 : 2} />
              {!!tab.count && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-accent-foreground">
                  {tab.count}
                </span>
              )}
            </span>
            <span
              className={cn("text-center text-[11px] font-medium leading-tight", isActive ? "text-accent" : "text-muted")}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
