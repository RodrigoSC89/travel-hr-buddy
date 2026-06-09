import { Router, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";
import { AuthenticatedRequest, ok, fail } from "../types";

const router = Router();
router.use(authMiddleware);

// GET /api/crew - list all crew members
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("crew_members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.json(ok(data));
});

// GET /api/crew/:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("crew_members")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(404).json(fail("Crew member not found"));
    return;
  }

  res.json(ok(data));
});

const crewSchema = z.object({
  name: z.string().min(1),
  rank: z.string().min(1),
  nationality: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "on_leave", "off_duty"]).default("active"),
});

// POST /api/crew
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = crewSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("crew_members")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.status(201).json(ok(data));
});

// PATCH /api/crew/:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = crewSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(fail(parsed.error.message));
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("crew_members")
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

// DELETE /api/crew/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { error } = await supabaseAdmin
    .from("crew_members")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    res.status(500).json(fail(error.message));
    return;
  }

  res.json(ok({ deleted: true }));
});

export default router;
