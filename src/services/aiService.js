// src/services/aiService.js
import axios from "axios";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_KEY) {
  console.error("❌ Gemini API key missing. Please set VITE_GEMINI_API_KEY in your .env file.");
}

/* --------------------
   MAIN FUNCTION
-------------------- */
export async function generateLearningPlan(userPrompt) {
  if (!GEMINI_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
      GEMINI_KEY;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a structured JSON 5-day learning plan for this request: "${userPrompt}".
The JSON must be in this format:
{
  "courseTitle": "Learn <topic> in <N> days",
  "days": [
    { "day": 1, "topic": "Introduction", "tasks": ["Task 1", "Task 2"] },
    { "day": 2, "topic": "Next Topic", "tasks": ["Task 1", "Task 2"] }
  ]
}`,
            },
          ],
        },
      ],
    };

    const res = await axios.post(url, body);

    let text =
      res?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      res?.data?.output_text ||
      "Unable to generate content";

    console.log("✅ Gemini raw response:", text);

    try {
      const parsed = JSON.parse(text);
      return { response: `Here's your 5-day plan for "${parsed.courseTitle}"`, plan: parsed };
    } catch {
      return { response: text.trim(), plan: null };
    }
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    throw new Error("Failed to generate learning plan with Gemini.");
  }
}
