import Standup from "../models/Standup.js";

const SYSTEM_PROMPT =
  "You are a technical writer. Reformat the standup into 3 sections: ✅ Done, 🔨 Doing, 🚧 Blockers. Extract 3–5 keyword tags. Return JSON: { summary: string, tags: string[] }";
const DEFAULT_GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b"
];

const getModelCandidates = () => {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  if (!configuredModel) {
    return DEFAULT_GEMINI_MODELS;
  }

  return [configuredModel, ...DEFAULT_GEMINI_MODELS.filter((model) => model !== configuredModel)];
};

const normalizeCommitMessage = (message) => {
  if (typeof message !== "string") {
    return "";
  }

  return message
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.toLowerCase().startsWith("co-authored-by:")) || "";
};

const getRecentCommitMessages = async () => {
  const username = process.env.GITHUB_USERNAME;
  if (!username) {
    return [];
  }
  const repo = process.env.GITHUB_REPO;

  const response = await fetch(`https://api.github.com/users/${username}/events?per_page=5`, {
    headers: { Accept: "application/vnd.github+json" }
  });
  const events = response.ok ? await response.json() : [];
  const eventCommits = events
    .filter((event) => event.type === "PushEvent")
    .flatMap((event) => event.payload?.commits || [])
    .map((commit) => normalizeCommitMessage(commit.message))
    .filter(Boolean)
    .slice(0, 5);

  if (eventCommits.length > 0 || !repo) {
    return eventCommits;
  }

  const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=5`, {
    headers: { Accept: "application/vnd.github+json" }
  });

  if (!repoResponse.ok) {
    return eventCommits;
  }

  const repoCommits = await repoResponse.json();
  return repoCommits
    .map((commit) => normalizeCommitMessage(commit?.commit?.message))
    .filter(Boolean)
    .slice(0, 5);
};

export const getCommitContext = async (_req, res) => {
  try {
    const commits = await getRecentCommitMessages();
    return res.status(200).json({ commits });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch commit context.", error: error.message });
  }
};

const extractJsonObject = (text) => {
  const cleaned = text.replace(/```json\s*|\s*```/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model response.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

export const createStandup = async (req, res) => {
  try {
    const { raw, mcpCommits } = req.body;
    if (!raw || typeof raw !== "string") {
      return res.status(400).json({ message: "Field 'raw' is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured." });
    }

    const githubCommits = await getRecentCommitMessages();
    const providedMcpCommits = Array.isArray(mcpCommits)
      ? mcpCommits.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
      : [];
    const combinedCommits = [...providedMcpCommits, ...githubCommits].slice(0, 5);

    const promptContext = combinedCommits.length
      ? `${raw}\n\nRecent commits: ${combinedCommits.join(" | ")}`
      : raw;

    const prompt = `${SYSTEM_PROMPT}\n\nStandup input:\n${promptContext}\n\nReturn valid JSON only.`;
    const modelCandidates = getModelCandidates();
    let textContent = "";
    let lastModelError = "";

    for (const modelName of modelCandidates) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (!response.ok) {
          lastModelError = await response.text();
          continue;
        }

        const data = await response.json();
        textContent =
          data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("\n")
            .trim() || "";

        if (textContent) {
          break;
        }
      } catch (modelError) {
        lastModelError = modelError.message || String(modelError);
      }
    }

    if (!textContent) {
      return res.status(500).json({
        message: "All configured Gemini models failed.",
        error: lastModelError || "No model response returned."
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(extractJsonObject(textContent));
    } catch (_error) {
      // Graceful fallback when model returns non-JSON text.
      parsed = {
        summary: `✅ Done: ${raw}\n🔨 Doing: In progress\n🚧 Blockers: Not specified`,
        tags: combinedCommits.length ? ["standup", "commits", "updates"] : ["standup", "updates"]
      };
    }

    const { summary, tags } = parsed;
    const standup = await Standup.create({
      raw,
      summary,
      tags: Array.isArray(tags) ? tags : []
    });

    return res.status(201).json(standup);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create standup.", error: error.message });
  }
};

export const getStandups = async (_req, res) => {
  try {
    const standups = await Standup.find().sort({ date: -1 });
    return res.status(200).json(standups);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch standups.", error: error.message });
  }
};

