import { Router, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";
import { AuthenticatedRequest, ok, fail } from "../types";

const router = Router();
router.use(authMiddleware);

// GET /api/missions
router.get("/", async (_req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("missions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.json(ok(data));
});

// GET /api/missions/:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("missions")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(404).json(fail("Mission not found"));
    return;
  }

  res.json(ok(data));
});

const missionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  vessel_id: z.string().uuid().optional(),
  status: z.enum(["pending", "active", "completed", "cancelled"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  due_date: z.string().datetime().optional(),
});

// POST /api/missions
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = missionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("missions")
    .insert({ ...parsed.data, created_by: req.user!.id })
    .select()
    .single();

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.status(201).json(ok(data));
});

// PATCH /api/missions/:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = missionSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("missions")
    .update(parsed.data)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.json(ok(data));
});

export default router;
