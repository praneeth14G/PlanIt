import "dotenv/config";
import express from "express";
import cors from "cors";
import { planRouter } from "./routes/plan.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use("/api", planRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
