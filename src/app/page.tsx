"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomNav, type NavTab } from "@/components/nav/BottomNav";
import { BrainDumpScreen } from "@/components/braindump/BrainDumpScreen";
import { InboxScreen } from "@/components/inbox/InboxScreen";
import { TodayScreen } from "@/components/today/TodayScreen";
import { LockedPanel } from "@/components/locked/LockedPanel";
import { Glow } from "@/components/mascot/Glow";
import { useTasks } from "@/store/TasksProvider";
import type { Task } from "@/types/task";

export default function Home() {
  const { tasks, isHydrated, addTasks } = useTasks();
  const [activeTab, setActiveTab] = useState<NavTab>("braindump");

  function handleParsed(newTasks: Task[]) {
    addTasks(newTasks);
    setActiveTab("inbox");
  }

  const inboxCount = tasks.filter((t) => t.status === "inbox").length;
  const todayCount = tasks.filter((t) => t.status === "today").length;

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <Glow size="lg" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {activeTab === "braindump" && <BrainDumpScreen onParsed={handleParsed} />}
      {activeTab === "inbox" && <InboxScreen onGoToBrainDump={() => setActiveTab("braindump")} />}
      {activeTab === "today" && <TodayScreen onGoToInbox={() => setActiveTab("inbox")} />}
      {activeTab === "locked" && <LockedPanel />}

      <BottomNav active={activeTab} onChange={setActiveTab} inboxCount={inboxCount} todayCount={todayCount} />
    </AppShell>
  );
}
