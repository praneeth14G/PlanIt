import { Router } from "express";
import { handlePlanTrip } from "../planTrip.js";

export const planRouter = Router();

planRouter.post("/plan-trip", async (req, res) => {
  const { status, body } = await handlePlanTrip(req.body);
  res.status(status).json(body);
});
