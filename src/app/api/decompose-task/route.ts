import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES, PRIORITIES, type Task } from "@/types/task";
import { generateId } from "@/lib/id";

export const runtime = "nodejs";

type ErrorCode = "auth_error" | "rate_limit" | "invalid_response" | "network";

const StepSchema = z.object({
  title: z.string(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  priority: z.enum(PRIORITIES as [string, ...string[]]),
  estimate_min: z.number(),
  deadline: z.string().nullable(),
});

const DecomposeResponseSchema = z.object({
  steps: z.array(StepSchema),
});

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Ти — Glow, теплий кар'єрний провідник у продукті StepWise Planner. Користувач має велику розмиту задачу: {title}. Розклади її на 3-5 конкретних виконуваних кроків по 15-60 хв кожен. Кроки формулюй як дії від першої особи, українською, без канцеляриту. Якщо задача вже конкретна і мала - поверни один уточнений крок.

Для кожного кроку визнач:
- title: дія від першої особи, коротко й конкретно (наприклад «Напишу список компаній», а не «Складання переліку компаній»).
- category: одне з рівно цих значень — ${CATEGORIES.join(", ")}.
- priority: висока, середня або низька — оцінюй за терміновістю й важливістю, яку можна зрозуміти з контексту.
- estimate_min: реалістична оцінка часу в хвилинах (ціле число, зазвичай 15-60).
- deadline: якщо з контексту випливає конкретний або відносний дедлайн — переведи його в дату у форматі YYYY-MM-DD, використовуючи сьогоднішню дату як точку відліку. Якщо дедлайну немає — null.

Сьогоднішня дата: ${today}.

Не вигадуй деталей, яких немає в задачі.`;
}

function logAnthropicError(context: string, error: unknown) {
  if (error instanceof Anthropic.APIError) {
    console.error(`[decompose-task] ${context}`, {
      status: error.status,
      type: error.type,
      name: error.name,
      message: error.message,
    });
    return;
  }
  console.error(`[decompose-task] ${context}`, error);
}

function errorResponse(userMessage: string, code: ErrorCode, status: number) {
  return NextResponse.json({ error: userMessage, code }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[decompose-task] Missing ANTHROPIC_API_KEY env var on the server.");
    return errorResponse("Сервер не налаштований: відсутній ANTHROPIC_API_KEY.", "auth_error", 500);
  }

  let parentId: string;
  let title: string;
  try {
    const body = await request.json();
    parentId = typeof body?.parentId === "string" ? body.parentId : "";
    title = typeof body?.title === "string" ? body.title.trim() : "";
  } catch (error) {
    console.error("[decompose-task] Failed to parse request body", error);
    return errorResponse("Некоректний запит.", "invalid_response", 400);
  }

  if (!parentId || !title) {
    return errorResponse("Некоректний запит.", "invalid_response", 400);
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: title }],
      output_config: {
        format: zodOutputFormat(DecomposeResponseSchema),
      },
    });

    if (response.stop_reason === "refusal") {
      console.error("[decompose-task] Claude refused the request", {
        stop_reason: response.stop_reason,
        stop_details: response.stop_details,
      });
      return errorResponse(
        "AI відмовився розкладати цю задачу. Спробуй переформулювати.",
        "invalid_response",
        422
      );
    }

    if (!response.parsed_output) {
      console.error("[decompose-task] No parsed_output in response", {
        stop_reason: response.stop_reason,
        content: response.content,
      });
      return errorResponse("Не вдалося розібрати відповідь AI. Спробуй ще раз.", "invalid_response", 502);
    }

    const now = new Date().toISOString();
    const tasks: Task[] = response.parsed_output.steps.map((s) => ({
      id: generateId("task"),
      title: s.title,
      category: s.category as Task["category"],
      priority: s.priority as Task["priority"],
      estimate_min: Math.max(5, Math.round(s.estimate_min)),
      deadline: s.deadline,
      status: "inbox",
      created_at: now,
      parent_id: parentId,
    }));

    if (tasks.length === 0) {
      return errorResponse("Не вдалося розкласти цю задачу. Спробуй ще раз.", "invalid_response", 502);
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      logAnthropicError("AuthenticationError calling Anthropic API", error);
      return errorResponse("Проблема з авторизацією AI-сервісу. Перевір ключ на сервері.", "auth_error", 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      logAnthropicError("RateLimitError calling Anthropic API", error);
      return errorResponse("Забагато запитів. Зачекай трохи і спробуй ще раз.", "rate_limit", 429);
    }
    if (error instanceof Anthropic.APIConnectionError) {
      logAnthropicError("APIConnectionError calling Anthropic API", error);
      return errorResponse("Не вдалося з'єднатися з AI-сервісом. Спробуй ще раз.", "network", 502);
    }
    if (error instanceof Anthropic.APIError) {
      logAnthropicError("APIError calling Anthropic API", error);
      if (/credit balance/i.test(error.message)) {
        return errorResponse(
          "На акаунті Anthropic закінчились кредити. Поповни баланс у Plans & Billing на console.anthropic.com.",
          "auth_error",
          500
        );
      }
      return errorResponse("AI-сервіс тимчасово недоступний. Спробуй ще раз.", "invalid_response", 502);
    }
    logAnthropicError("Unexpected error calling Anthropic API", error);
    return errorResponse("Щось пішло не так. Спробуй ще раз.", "invalid_response", 500);
  }
}
