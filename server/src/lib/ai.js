import OpenAI from "openai";

// Create a singleton OpenAI client lazily to avoid throwing if key missing at import time
let _client = null;
function getClient() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY not configured");
    err.code = "NO_OPENAI_KEY";
    throw err;
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

// Clean and bound the list of skills to 5-10 discrete strings
function normalizeSkills(list) {
  if (!Array.isArray(list)) return [];
  const cleaned = list
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => s.length > 0);
  // De-duplicate case-insensitively
  const seen = new Set();
  const unique = [];
  for (const s of cleaned) {
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(s);
    }
  }
  return unique.slice(0, 10);
}

// JSON schema to guide the model output
const jsonSchemaFormat = {
  type: "json_schema",
  json_schema: {
    name: "skills_summary_schema",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        skills: {
          type: "array",
          minItems: 1,
          maxItems: 10,
          items: { type: "string" },
        },
        summary: { type: "string" },
      },
      required: ["skills", "summary"],
    },
    strict: true,
  },
};

export async function extractSkills(jobDescription) {
  try {
    const client = getClient();
    const prompt = `You are an assistant that reads a job description and extracts a concise list of core skills plus a one to two sentence summary.

Constraints:
- Return only 5–10 distinct skills.
- Prefer general, transferable skills over vendor-specific when redundant.
- Keep summary objective and succinct (1–2 sentences).
- Return JSON in this exact format: {"skills": ["skill1", "skill2", ...], "summary": "..."}

Job description:

${jobDescription}`;

    // Prefer a reasonably small, widely available model name; can be tweaked via env
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const resp = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    // Extract JSON from chat completion response
    const content = resp?.choices?.[0]?.message?.content;
    let parsed = null;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch (_) {
        parsed = null;
      }
    }

    if (
      !parsed ||
      !Array.isArray(parsed.skills) ||
      typeof parsed.summary !== "string"
    ) {
      // As a safety, return empty skills and raw content as summary
      return {
        skills: [],
        summary: content
          ? content.slice(0, 400)
          : "Unable to extract skills from job description.",
      };
    }

    const skills = normalizeSkills(parsed.skills);
    const summary = (parsed.summary || "").trim();
    return { skills, summary };
  } catch (err) {
    // Bubble up for the route to map to 502
    throw err;
  }
}

export default { extractSkills };
