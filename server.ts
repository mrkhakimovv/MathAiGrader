import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/grade", async (req, res) => {
    try {
      const { imageBase64, mimeType, problemContext } = req.body;

      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const promptString = `You are an expert mathematics teacher evaluating a student's homework submission. Your native language is Uzbek, and you MUST provide all feedback, explanations, and evaluations exclusively in the Uzbek language.

${problemContext ? `The student was asked to solve the following problem: "${problemContext}"` : "The student submitted a math problem."}

Please analyze the provided image of the student's work. Follow these steps:
1. Carefully transcribe the student's entire solution, line by line. Use LaTeX enclosed in $ for inline math and $$ for block math (e.g. $x^2 + y^2 = z^2$).
2. Verify each step of the reasoning and calculation.
3. Determine the final answer the student arrived at.
4. Check if the final answer is correct and if all intermediate steps are logically and mathematically sound.
5. Provide a score out of 10.
6. Provide constructive feedback entirely in Uzbek. If there are errors, explain precisely where the error occurred and how to fix it. Be encouraging but clear. If it is perfect, praise the student's work in Uzbek.

IMPORTANT: 
- ALL text in the \`feedback\` and \`errorSteps\` fields MUST be written strictly in the UZBEK LANGUAGE. Do not use English.
- The \`transcription\` MUST use markdown formatting with LaTeX math enclosed in $ or $$. 
- Do not use bare LaTeX commands without enclosing them in $ or $$.

Output the result in JSON format matching the schema.`;

      let response;
      let retries = 5;
      let delayMs = 3000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    data: imageBase64.split(",")[1] || imageBase64,
                    mimeType: mimeType,
                  },
                },
                {
                  text: promptString,
                },
              ],
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  transcription: {
                    type: Type.STRING,
                    description: "The complete transcription of the student's work.",
                  },
                  isCorrect: {
                    type: Type.BOOLEAN,
                    description: "True if the final answer is completely correct and the steps are valid.",
                  },
                  isPartiallyCorrect: {
                    type: Type.BOOLEAN,
                    description: "True if there are some correct steps but the final answer is wrong or reasoning is flawed.",
                  },
                  score: {
                    type: Type.NUMBER,
                    description: "A score from 0 to 10 evaluating the work.",
                  },
                  feedback: {
                    type: Type.STRING,
                    description: "Constructive feedback for the student in Markdown format. Address the student directly.",
                  },
                  errorSteps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                    description: "A list of specific steps where the student made an error, if any.",
                  },
                },
                required: ["transcription", "isCorrect", "isPartiallyCorrect", "score", "feedback", "errorSteps"],
              },
            },
          });
          break; // Success, exit retry loop
        } catch (err: any) {
          retries--;
          
          if (retries === 0) {
            const errorMsg = err.message || "";
            if (errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE")) {
              throw new Error("Sun'iy intellekt tizimi hozirda juda band (503). Iltimos, bir ozdan so'ng qayta urining.");
            }
            if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
              throw new Error("Tizimning ishlash limiti tugadi. Iltimos, bir necha soniyadan so'ng qayta urining.");
            }
            throw err;
          }
          
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff
        }
      }

      const jsonStr = response?.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);

      res.json(result);
    } catch (error: any) {
      console.error("Error evaluating homework:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate homework." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:\${PORT}`);
  });
}

startServer();
