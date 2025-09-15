import { Router } from "express";
import auth from "../middleware/auth.js";
import { extractSkills } from "../lib/ai.js";

const router = Router();

// POST /ai/extract-skills — protected
router.post("/extract-skills", auth, async (req, res) => {
  const jobDescription = req?.body?.jobDescription;

  if (
    typeof jobDescription !== "string" ||
    jobDescription.trim().length === 0
  ) {
    return res
      .status(400)
      .json({ error: "jobDescription must be a non-empty string" });
  }

  try {
    const result = await extractSkills(jobDescription);
    return res.json(result);
  } catch (err) {
    // Don't leak details to client
    console.error("extract-skills failed:", err);
    return res.status(502).json({ error: "AI_SERVICE_ERROR" });
  }
});

export default router;
