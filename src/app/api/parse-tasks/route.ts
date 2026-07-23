import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES, PRIORITIES, type Task } from "@/types/task";
import { generateId } from "@/lib/id";

export const runtime = "nodejs";

const ParsedTaskSchema = z.object({
  title: z.string(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  priority: z.enum(PRIORITIES as [string, ...string[]]),
  estimate_min: z.number(),
  deadline: z.string().nullable(),
});

const ParsedResponseSchema = z.object({
  tasks: z.array(ParsedTaskSchema),
});

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Ти — AI-асистент продукту StepWise Planner. Користувач вивалює хаотичні думки про кар'єрні задачі (текстом або розпізнаним голосом). Розбий цей потік на окремі, конкретні, дієві задачі.

Для кожної задачі визнач:
- title: коротка, конкретна, дієслівна назва (наприклад «Оновити резюме», а не просто «резюме»).
- category: одне з рівно цих значень — навчання, нетворкінг, портфоліо, пошук, інше.
- priority: висока, середня або низька — оцінюй за терміновістю й важливістю, яку можна зрозуміти з тексту.
- estimate_min: реалістична оцінка часу в хвилинах (ціле число, зазвичай 10-120).
- deadline: якщо в тексті згадано конкретний або відносний дедлайн (наприклад «до п'ятниці», «через два тижні») — переведи його в дату у форматі YYYY-MM-DD, використовуючи сьогоднішню дату як точку відліку. Якщо дедлайну немає — null.

Сьогоднішня дата: ${today}.

Не вигадуй задачі, яких немає в тексті. Якщо одна думка описує кілька дій — розбий на кілька задач. Якщо думка сформульована розмито — перетвори її на конкретний перший крок, а не пропускай.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Сервер не налаштований: відсутній ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  let text: string;
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Порожній текст — нічого розбирати." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: text }],
      output_config: {
        format: zodOutputFormat(ParsedResponseSchema),
      },
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "AI відмовився розбирати цей текст. Спробуй переформулювати." },
        { status: 422 }
      );
    }

    if (!response.parsed_output) {
      return NextResponse.json(
        { error: "Не вдалося розібрати відповідь AI. Спробуй ще раз." },
        { status: 502 }
      );
    }

    const now = new Date().toISOString();
    const tasks: Task[] = response.parsed_output.tasks.map((t) => ({
      id: generateId("task"),
      title: t.title,
      category: t.category as Task["category"],
      priority: t.priority as Task["priority"],
      estimate_min: Math.max(5, Math.round(t.estimate_min)),
      deadline: t.deadline,
      status: "inbox",
      created_at: now,
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Проблема з авторизацією AI-сервісу. Перевір ключ на сервері." },
        { status: 500 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Забагато запитів. Зачекай трохи і спробуй ще раз." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "AI-сервіс тимчасово недоступний. Спробуй ще раз." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Щось пішло не так. Спробуй ще раз." }, { status: 500 });
  }
}
