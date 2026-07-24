import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES, PRIORITIES, type Task } from "@/types/task";
import { generateId } from "@/lib/id";

export const runtime = "nodejs";

type ErrorCode = "auth_error" | "rate_limit" | "invalid_response" | "network";

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
  return `Ти — AI-асистент продукту StepWise Planner. Користувач вивалює хаотичні думки про будь-який життєвий хаос — робочі задачі, навчання, особисті справи, здоров'я, побут (текстом або розпізнаним голосом). Розбий цей потік на окремі, конкретні, дієві задачі.

Для кожної задачі визнач:
- title: коротка, конкретна, дієслівна назва (наприклад «Оновити резюме», а не просто «резюме»).
- category: одне з рівно цих значень — робота, навчання, особисте, здоров'я, побут, інше. Кар'єрні задачі (резюме, співбесіди, нетворкінг, пошук роботи) належать до категорії «робота». Якщо не впевнений, до якої категорії віднести — обери «інше».
- priority: висока, середня або низька — оцінюй за терміновістю й важливістю, яку можна зрозуміти з тексту.
- estimate_min: реалістична оцінка часу в хвилинах (ціле число, зазвичай 10-120).
- deadline: якщо в тексті згадано конкретний або відносний дедлайн (наприклад «до п'ятниці», «через два тижні») — переведи його в дату у форматі YYYY-MM-DD, використовуючи сьогоднішню дату як точку відліку. Якщо дедлайну немає — null.

Сьогоднішня дата: ${today}.

Не вигадуй задачі, яких немає в тексті. Якщо одна думка описує кілька дій — розбий на кілька задач. Якщо думка сформульована розмито — перетвори її на конкретний перший крок, а не пропускай.`;
}

function logAnthropicError(context: string, error: unknown) {
  if (error instanceof Anthropic.APIError) {
    console.error(`[parse-tasks] ${context}`, {
      status: error.status,
      type: error.type,
      name: error.name,
      message: error.message,
    });
    return;
  }
  console.error(`[parse-tasks] ${context}`, error);
}

function errorResponse(userMessage: string, code: ErrorCode, status: number) {
  return NextResponse.json({ error: userMessage, code }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[parse-tasks] Missing ANTHROPIC_API_KEY env var on the server.");
    return errorResponse("Сервер не налаштований: відсутній ANTHROPIC_API_KEY.", "auth_error", 500);
  }

  let text: string;
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch (error) {
    console.error("[parse-tasks] Failed to parse request body", error);
    return errorResponse("Некоректний запит.", "invalid_response", 400);
  }

  if (!text) {
    return errorResponse("Порожній текст — нічого розбирати.", "invalid_response", 400);
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
      console.error("[parse-tasks] Claude refused the request", {
        stop_reason: response.stop_reason,
        stop_details: response.stop_details,
      });
      return errorResponse(
        "AI відмовився розбирати цей текст. Спробуй переформулювати.",
        "invalid_response",
        422
      );
    }

    if (!response.parsed_output) {
      console.error("[parse-tasks] No parsed_output in response", {
        stop_reason: response.stop_reason,
        content: response.content,
      });
      return errorResponse("Не вдалося розібрати відповідь AI. Спробуй ще раз.", "invalid_response", 502);
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
