import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePlanTrip } from "../server/src/planTrip.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: { code: "INVALID_INPUT", message: "Method not allowed." } });
    return;
  }

  const { status, body } = await handlePlanTrip(req.body);
  res.status(status).json(body);
}
