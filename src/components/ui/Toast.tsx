export function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-5">
      <div className="pointer-events-auto rounded-full border border-card-border bg-card px-4 py-2.5 text-xs text-foreground shadow-lg">
        {message}
      </div>
    </div>
  );
}
