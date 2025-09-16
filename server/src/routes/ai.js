import { Router } from "express";
import auth from "../middleware/auth.js";
import { extractSkills } from "../lib/ai.js";
import { badRequest } from "../middleware/error.js";

const router = Router();

// POST /ai/extract-skills — protected
router.post("/extract-skills", auth, async (req, res, next) => {
  const jobDescription = req?.body?.jobDescription;

  if (
    typeof jobDescription !== "string" ||
    jobDescription.trim().length === 0
  ) {
    return next(badRequest("jobDescription must be a non-empty string"));
  }

  try {
    const result = await extractSkills(jobDescription);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;
