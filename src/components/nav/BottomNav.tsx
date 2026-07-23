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

export function BottomNav({ active, onChange, inboxCount, todayCount }: BottomNavProps) {
  const tabs: { id: NavTab; label: string; icon: typeof PenLine; count?: number; small?: boolean }[] = [
    { id: "braindump", label: "Розвантаж", icon: PenLine },
    { id: "inbox", label: "Розбір", icon: Inbox, count: inboxCount },
    { id: "today", label: "Сьогодні", icon: ListChecks, count: todayCount },
    { id: "locked", label: "Скоро: Аналіз · Пасвеї · Роадмеп", icon: Lock, small: true },
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
              className={cn(
                "text-center font-medium leading-tight",
                tab.small ? "text-[8px]" : "text-[11px]",
                isActive ? "text-accent" : "text-muted"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
