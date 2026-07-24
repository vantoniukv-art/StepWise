"use client";

import { useCallback, useState } from "react";
import { AlertCircle, ArrowUp, Loader2, Mic } from "lucide-react";
import { Glow } from "@/components/mascot/Glow";
import { Button } from "@/components/ui/Button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { hasSeenIntro, markIntroSeen } from "@/lib/introSeen";
import type { Task } from "@/types/task";

interface BrainDumpScreenProps {
  onParsed: (tasks: Task[]) => void;
}

const ERROR_EMPTY = "Напиши хоча б пару слів, і почнемо";
const ERROR_PARSE_FAILED = "Ой, щось збилось. Спробуй ще раз, текст нікуди не зник";
const ERROR_NO_CONNECTION = "Схоже, зник інтернет. Перевір з'єднання і спробуй ще раз";
const ERROR_NO_TASKS_FOUND = "Не знайшла в цьому конкретних задач — спробуй додати більше деталей.";
const ERROR_AUTH = "Тимчасова технічна пауза. Спробуй за хвилину";

const INTRO_TEXT =
  "Привіт, я Glow. Я допомагаю, коли в кар'єрі забагато 'треба' і незрозуміло, з чого почати. Просто напиши все, що крутиться в голові, далі - моя робота.";

export function BrainDumpScreen({ onParsed }: BrainDumpScreenProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  const handleVoiceResult = useCallback((transcript: string) => {
    if (!transcript) return;
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const { status: voiceStatus, isSupported: isVoiceSupported, start: startVoice } =
    useVoiceInput(handleVoiceResult);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (isLoading) return;

    if (!trimmed) {
      setError(ERROR_EMPTY);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        let code: string | undefined;
        try {
          const errorBody = await res.json();
          code = errorBody?.code;
        } catch {
          // response wasn't JSON — fall through with no code
        }
        setError(code === "auth_error" ? ERROR_AUTH : ERROR_PARSE_FAILED);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const tasks: Task[] = data.tasks ?? [];
      if (tasks.length === 0) {
        setError(ERROR_NO_TASKS_FOUND);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsCelebrating(true);
      markIntroSeen();
      setShowIntro(false);
      setTimeout(() => {
        setIsCelebrating(false);
        setText("");
        onParsed(tasks);
      }, 700);
    } catch {
      setError(ERROR_NO_CONNECTION);
      setIsLoading(false);
    }
  }

  const glowState = isCelebrating ? "celebrating" : isLoading ? "thinking" : "neutral";
  const subtitle = isLoading
    ? "Glow збирає з цього план..."
    : "Розкажи, що зараз відбувається: плани, сумніви, хаос упереміш. Glow розкладе це на чіткі кроки і збере план на сьогодні.";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-6">
      <header className="mb-5 flex items-start gap-3">
        <Glow state={glowState} size="lg" className="mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight">Не знаєш, за що хапатись?</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
      </header>

      {showIntro && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-card-border bg-card/70 p-4">
          <Glow size="md" className="flex-shrink-0" />
          <p className="text-sm leading-relaxed text-muted">{INTRO_TEXT}</p>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="хочу перейти в продакт-менеджмент, треба оновити резюме, не розумію, чи вчити SQL, до п'ятниці дедлайн по курсу..."
        disabled={isLoading || isCelebrating}
        rows={8}
        className="flex-1 resize-none rounded-2xl border border-card-border bg-card p-4 text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-accent/60 focus:outline-none disabled:opacity-60"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        {isVoiceSupported ? (
          <button
            type="button"
            onClick={startVoice}
            disabled={voiceStatus === "listening" || voiceStatus === "processing" || isLoading}
            aria-label="Сказати голосом"
            title="Сказати голосом"
            className="flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-2 text-xs text-muted disabled:opacity-60"
          >
            {voiceStatus === "listening" || voiceStatus === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {voiceStatus === "listening"
              ? "Слухаю..."
              : voiceStatus === "processing"
                ? "Розпізнаю..."
                : voiceStatus === "error"
                  ? "Не розчула, спробуй ще"
                  : "Сказати голосом"}
          </button>
        ) : (
          <span />
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-priority-high/10 px-3 py-2.5 text-xs text-priority-high">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || isCelebrating}
        className="mt-4 w-full text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Розбираю...
          </>
        ) : (
          <>
            Показати мені кроки <ArrowUp className="h-4 w-4 rotate-45" />
          </>
        )}
      </Button>
    </div>
  );
}
