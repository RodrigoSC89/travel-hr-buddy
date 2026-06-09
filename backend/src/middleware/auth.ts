import { Response, NextFunction } from "express";
import { supabaseAdmin } from "../services/supabase";
import { AuthenticatedRequest, fail } from "../types";

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json(fail("Missing or invalid Authorization header"));
    return;
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json(fail("Invalid or expired token"));
    return;
  }

  req.user = {
    id: data.user.id,
    email: data.user.email ?? "",
    role: (data.user.app_metadata?.role as string) ?? "user",
  };

  next();
}
