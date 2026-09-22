import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const MODEL_MAP: Record<string, string> = {
  pro: "gemini-2.5-pro",
  lite: "gemini-2.5-flash-lite",
  code: "gemini-2.5-flash",
};

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      }),
    )
    .min(1)
    .max(50),
  model: z.string().default("lite"),
  expertMode: z.string().default("pro-coder"),
});

const BASE_SYSTEM_PROMPT = `أنت NOUR AI STUDIO — مساعد ذكاء اصطناعي متخصص في تطوير التطبيقات والمواقع والتحليلات المالية والرياضية.

# قواعد الرد — التزم بها دائماً:

## الاختصار والوضوح
- السطر الأول دائماً عريض (bold) ويلخّص الجواب في جملة واحدة.
- بعده استخدم نقاط (•) قصيرة ومباشرة لشرح التفاصيل أو الخطوات.
- لا تكتب فقرات طويلة مملة.

## قبل بناء أي تطبيق — اسأل أولاً!
- ❌ لا تبدأ ببناء أي تطبيق أو موقع أو كود مباشرة أبداً.
- ✅ اسأل المستخدم أولاً:
  • ما نوع التطبيق/الموقع؟
  • ما المنصة؟ (ويب، جوال، الكل)
  • ما أهم الميزات؟
  • هل عندك تصميم أو ألوان معيّنة؟
- ابدأ البناء فقط بعد ما يجاوب.

## تصحيح تلقائي والذاكرة
- صحّح الأخطاء الإملائية صامتاً بدون تعليق.
- تذكّر كل المحادثة والقرارات السابقة.

## إصلاح الأخطاء
- إذا أبلغ المستخدم بخطأ، أعد كتابة الملف كاملاً مُصلَحاً.
- لا placeholders ولا // TODO ولا "rest of code".
## قواعد الكود — مهمة جداً!
- عند كتابة أي كود (مؤشر، استراتيجية، برنامج)، ضع الكود فقط داخل code fence (ثلاث علامات backtick).
- داخل الـ code fence يجب أن يكون كود صافي 100% جاهز للنسخ واللصق مباشرة. بدون شرح أو تعليقات عربية.
- أي شرح أو ملاحظات ضعها خارج الـ code fence قبله أو بعده.
- لا تضع أبداً عنوان أو وصف داخل بلوك الكود.
- حدد نوع اللغة دائماً بعد الـ backticks (مثل: \`\`\`mql5 أو \`\`\`pine أو \`\`\`html).

اللغة الافتراضية: لغة آخر رسالة من المستخدم.`;

const EXPERT_PROMPTS: Record<string, string> = {
  "pro-coder": `
[EXPERT MODE: Pro Coding & Security]
Act as an AST-compliant Senior Developer & Security Engineer. 
- AST-compliant editing, multi-file context understanding.
- Auto-refactoring, unit/integration/E2E test generation.
- SAST scanning (OWASP Top 10 vulnerabilities), CVE dependency audit.
- Memory leak debugging, Big-O complexity analysis, and strict code translation (Python/Rust/Go/TypeScript).
- Zero placeholders, fully written production-ready code.`,

  "quant-trader": `
[EXPERT MODE: Quant & HFT Trading]
Act as a Hedge Fund Algorithmic Engineer. 
- Build backtesting engines, run Monte Carlo simulations (10,000 scenarios), and forward-walk optimizers.
- Analyze market microstructure, order book imbalance (Level 2 data), and Smart Money Concepts (SMC: FVG, Order Blocks, Liquidity Pools).
- Formulate cross-exchange arbitrage strategies and sentiment scrapers (NLP news parser).
- Allocate capital using Kelly Criterion and Risk Parity.
- Write strict Pine Script v6, MQL5, or cTrader code with capital risk safety parameters.`,

  "math-data": `
[EXPERT MODE: Complex Math & Data]
Act as a Deterministic Math Engine. 
- Solve symbolic algebra/CAS (calculus, differential equations, high-dimensional matrices, SVD).
- Implement statistical forecasting (Bayesian Inference, ARIMA, Prophet, LSTM networks).
- Develop graph algorithms (Dijkstra, A*) and SMT/Constraint solvers (SAT/SMT).
- Utilize high-performance computing structures (Digital Signal Processing, FFT, AutoML).
- Force Chain of Thought reasoning, output calculations step-by-step.`,

  "enterprise-architect": `
[EXPERT MODE: Enterprise Architect]
Act as a Principal System Architect & Chaos Engineer.
- Output complete production-ready microservice blueprints, database schemas, and ERD structures.
- Format multi-file architectures using:
>>>> FILE: path/to/filename.ext
\`\`\`extension
code
\`\`\`
Ensure 'index.html' is present as the entrypoint for live preview rendering.
- Design Event Sourcing workflows (CQRS, Event Store) and GraphQL federations.
- Implement distributed tracing hooks, Chaos Engineering specs (Chaos Monkey), load test triggers (k6/Locust), and strict compliance guards (GDPR, HIPAA, PCI-DSS).`
};


/* ─── Google Gemini API (direct REST — no SDK needed) ─── */
async function streamViaGemini(
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<Response> {
  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: geminiMessages,
      generationConfig: { temperature: 0.2, topP: 0.95, maxOutputTokens: 8192 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Gemini API error:", res.status, errText);
    if (res.status === 429) return new Response("تم تجاوز حد الاستخدام. حاول لاحقاً.", { status: 429 });
    if (res.status === 403 || res.status === 401) return new Response("مفتاح API غير صالح. تأكد من GOOGLE_API_KEY.", { status: 401 });
    return new Response(`خطأ من Gemini: ${res.status}`, { status: 502 });
  }

  return transformSSE(res, (data: Record<string, unknown>) => {
    const candidates = data?.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
    return candidates?.[0]?.content?.parts?.[0]?.text;
  });
}


/* ─── Lovable AI Gateway (OpenAI-compatible SSE) ─── */
async function streamViaLovable(
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<Response> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: modelId,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Lovable API error:", res.status, errText);
    if (res.status === 429) return new Response("تم تجاوز حد الاستخدام. حاول لاحقاً.", { status: 429 });
    if (res.status === 402) return new Response("نفدت أرصدة الذكاء الاصطناعي.", { status: 402 });
    if (res.status === 401) return new Response("مفتاح Lovable غير صالح.", { status: 401 });
    return new Response(`خطأ من الخادم: ${res.status}`, { status: 502 });
  }

  return transformSSE(res, (data: Record<string, unknown>) => {
    const choices = data?.choices as Array<{ delta?: { content?: string } }> | undefined;
    return choices?.[0]?.delta?.content;
  });
}


/* ─── Shared SSE → text stream transformer ─── */
function transformSSE(
  upstream: Response,
  extractText: (data: Record<string, unknown>) => string | undefined,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const data = JSON.parse(jsonStr);
              const text = extractText(data);
              if (text) controller.enqueue(encoder.encode(text));
            } catch { /* skip malformed */ }
          }
        }
      } catch (err) { console.error("Stream read error:", err); }
      finally { controller.close(); }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}


/* ─── Route Handler ─── */
export const Route = createFileRoute("/api/chat-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return new Response("خطأ في البيانات", { status: 400 });
        }

        const modelKey = ["pro", "lite", "code"].includes(parsed.data.model)
          ? parsed.data.model
          : "lite";

        const expertMode = parsed.data.expertMode;
        const expertPrompt = EXPERT_PROMPTS[expertMode] || EXPERT_PROMPTS["pro-coder"];
        const combinedSystemPrompt = `${BASE_SYSTEM_PROMPT}\n${expertPrompt}`;

        const googleKey = process.env.GOOGLE_API_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;

        const messages = parsed.data.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        try {
          if (googleKey) {
            const modelId = MODEL_MAP[modelKey] || MODEL_MAP["lite"];
            return await streamViaGemini(googleKey, modelId, combinedSystemPrompt, messages);
          } else if (lovableKey) {
            const lovableModelMap: Record<string, string> = {
              pro: "google/gemini-2.5-pro",
              lite: "google/gemini-2.5-flash-lite",
              code: "google/gemini-2.5-flash",
            };
            const modelId = lovableModelMap[modelKey] || lovableModelMap["lite"];
            return await streamViaLovable(lovableKey, modelId, combinedSystemPrompt, messages);
          } else {
            return new Response(
              "مفتاح API غير موجود. أضف GOOGLE_API_KEY أو LOVABLE_API_KEY في ملف .env",
              { status: 500 },
            );
          }
        } catch (err) {
          console.error("Handler error:", err);
          const e = err as { message?: string };
          return new Response(`تعذّر الاتصال: ${e.message || "خطأ غير متوقع"}`, { status: 500 });
        }
      },
    },
  },
});
