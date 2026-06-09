import { Router, Response } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/auth";
import { AuthenticatedRequest, ok, fail } from "../types";

const router = Router();
router.use(authMiddleware);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  context: z.enum(["general", "compliance", "hr", "travel"]).default("general"),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  general:
    "You are Nautilus AI, a maritime operations assistant. Help the user with vessel operations, crew management, and compliance questions.",
  compliance:
    "You are a maritime compliance expert specializing in MLC 2006, STCW, ISM Code, and MARPOL. Provide accurate regulatory guidance.",
  hr: "You are a maritime HR specialist. Help with crew contracts, payroll, certifications, leave management, and workforce planning.",
  travel:
    "You are a travel coordinator for maritime crews. Help with repatriation, flights, hotels, and crew change logistics.",
};

// POST /api/ai/chat
router.post("/chat", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { messages, context } = parsed.data;
  const systemPrompt = SYSTEM_PROMPTS[context];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    res.json(ok({ reply, usage: completion.usage }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    res.status(500).json(fail(message));
  }
});

// POST /api/ai/chat/stream
router.post("/chat/stream", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { messages, context } = parsed.data;
  const systemPrompt = SYSTEM_PROMPTS[context];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI stream failed";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
