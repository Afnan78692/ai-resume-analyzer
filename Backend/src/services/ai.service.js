const { GoogleGenAI } = require("@google/genai");

const VALID_SEVERITIES = ["high", "medium", "low"];

function getAiClient() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is required");
  }

  return new GoogleGenAI({ apiKey });
}

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const jsonStart = withoutFence.indexOf("{");
    const jsonEnd = withoutFence.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error("AI response did not contain a JSON object");
    }

    try {
      return JSON.parse(withoutFence.slice(jsonStart, jsonEnd + 1));
    } catch (error) {
      throw new Error(`AI response was not valid JSON: ${error.message}`);
    }
  }
}

function toText(value, fallback = "") {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function inferSeverity(skill, severity) {
  const normalized = toText(severity).toLowerCase();

  if (VALID_SEVERITIES.includes(normalized)) {
    return normalized;
  }

  const topic = toText(skill).toLowerCase();

  if (/testing|integration|security|devops|docker|cloud|aws|database|postgres|sql|schema|system design/.test(topic)) {
    return "high";
  }

  if (/typescript|react|node|express|api|performance|state|validation|mongodb/.test(topic)) {
    return "medium";
  }

  return "low";
}

function normalizeQuestion(item, index, type) {
  if (typeof item === "string") {
    return {
      question: item.trim() || `${type} question ${index + 1}`,
      intention: `Assess the candidate's ${type.toLowerCase()} readiness for the target role.`,
      answer: "Prepare a clear, project-backed answer with the problem, approach, trade-offs, and result.",
    };
  }

  return {
    question: toText(item?.question, `${type} question ${index + 1}`),
    intention: toText(item?.intention, `Assess the candidate's ${type.toLowerCase()} readiness for the target role.`),
    answer: toText(
      item?.answer,
      "Prepare a clear, project-backed answer with the problem, approach, trade-offs, and result."
    ),
  };
}

function normalizeSkillGap(item) {
  const skill = typeof item === "string" ? item : item?.skill;
  const skillText = toText(skill, "Role-specific preparation");

  return {
    skill: skillText,
    severity: inferSeverity(skillText, item?.severity),
  };
}

function normalizePreparationDay(item, index) {
  if (typeof item === "string") {
    return {
      day: index + 1,
      focus: `Preparation Day ${index + 1}`,
      tasks: [item.trim()].filter(Boolean),
    };
  }

  const tasks = Array.isArray(item?.tasks)
    ? item.tasks.map((task) => toText(task)).filter(Boolean)
    : [toText(item?.task)].filter(Boolean);

  return {
    day: Number(item?.day) || index + 1,
    focus: toText(item?.focus, `Preparation Day ${index + 1}`),
    tasks: tasks.length > 0 ? tasks : ["Review the core concepts and practice one role-specific example."],
  };
}

function normalizeInterviewReport(report) {
  const technicalQuestions = Array.isArray(report?.technicalQuestions) ? report.technicalQuestions : [];
  const behavioralQuestions = Array.isArray(report?.behavioralQuestions) ? report.behavioralQuestions : [];
  const skillGaps = Array.isArray(report?.skillGaps) ? report.skillGaps : [];
  const preparationPlan = Array.isArray(report?.preparationPlan) ? report.preparationPlan : [];
  const matchScore = Math.min(Math.max(Number(report?.matchScore) || 0, 0), 100);

  return {
    title: toText(report?.title, "Interview Report"),
    matchScore,
    technicalQuestions: technicalQuestions.map((question, index) =>
      normalizeQuestion(question, index, "Technical")
    ),
    behavioralQuestions: behavioralQuestions.map((question, index) =>
      normalizeQuestion(question, index, "Behavioral")
    ),
    skillGaps: skillGaps.map(normalizeSkillGap),
    preparationPlan: preparationPlan.map(normalizePreparationDay),
  };
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const prompt = `
Generate a detailed interview report as raw JSON only.
Do not wrap the JSON in markdown fences, backticks, comments, or prose.
Arrays must contain objects, not plain strings.
Return this exact shape:
{
  "title": "string",
  "matchScore": 0,
  "technicalQuestions": [{ "question": "string", "intention": "string", "answer": "string" }],
  "behavioralQuestions": [{ "question": "string", "intention": "string", "answer": "string" }],
  "skillGaps": [{ "skill": "string", "severity": "high" }],
  "preparationPlan": [{ "day": 1, "focus": "string", "tasks": ["string"] }]
}
For each skill gap, set severity to one of exactly: "high", "medium", or "low".
Use "high" for major gaps that need serious preparation, "medium" for moderate gaps, and "low" for minor polish.

Resume:
${resume}

Self description:
${selfDescription || "Not provided"}

Job description:
${jobDescription}
`;

  const response = await getAiClient().models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text =
    response?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "{}";

  return normalizeInterviewReport(parseJsonResponse(text));
}

async function generateResumePdf() {
  return Buffer.from("%PDF-1.4\n%...placeholder...");
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  parseJsonResponse,
  normalizeInterviewReport,
};
