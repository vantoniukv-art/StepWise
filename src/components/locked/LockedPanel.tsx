import { Lock } from "lucide-react";
import { Glow } from "@/components/mascot/Glow";

const LOCKED_ITEMS = [
  { title: "Аналіз", description: "AI проаналізує твоє резюме та профіль, підсвітить сильні сторони й прогалини." },
  { title: "Пасвеї", description: "Персональні напрямки розвитку кар'єри на основі твоїх цілей." },
  { title: "Роадмеп", description: "Довгостроковий план кроків до наступної ролі." },
];

export function LockedPanel() {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
      <header className="mb-6 flex flex-col items-center text-center">
        <Glow size="lg" className="mb-3" />
        <h1 className="text-lg font-semibold">Скоро тут буде більше</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Аналіз, пасвеї та роадмеп уже в розробці
        </p>
      </header>

      <div className="space-y-3">
        {LOCKED_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex cursor-not-allowed items-start gap-3 rounded-2xl border border-card-border bg-card/60 p-4 opacity-60"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-background">
              <Lock className="h-4 w-4 text-muted" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                  скоро
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
