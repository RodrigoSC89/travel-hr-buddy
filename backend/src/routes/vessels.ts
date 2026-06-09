import { Router, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";
import { AuthenticatedRequest, ok, fail } from "../types";

const router = Router();
router.use(authMiddleware);

// GET /api/vessels
router.get("/", async (_req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("vessels")
    .select("*")
    .order("name");

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.json(ok(data));
});

// GET /api/vessels/:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("vessels")
    .select("*, crew_members(*)")
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(404).json(fail("Vessel not found"));
    return;
  }

  res.json(ok(data));
});

const vesselSchema = z.object({
  name: z.string().min(1),
  imo_number: z.string().optional(),
  flag: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(["active", "in_port", "maintenance", "decommissioned"]).default("active"),
});

// POST /api/vessels
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = vesselSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("vessels")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.status(201).json(ok(data));
});

// PATCH /api/vessels/:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = vesselSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("vessels")
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
