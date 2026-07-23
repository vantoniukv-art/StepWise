export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-background sm:py-8">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background sm:h-[880px] sm:max-h-[92dvh] sm:rounded-[2.5rem] sm:border sm:border-card-border sm:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        {children}
      </div>
    </div>
  );
}
