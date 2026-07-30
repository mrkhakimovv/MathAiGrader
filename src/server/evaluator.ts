import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function analyzeTeacherExamples(images: { imageBase64: string, mimeType: string }[]) {
  const promptString = `You are an expert mathematics teacher analyzing a homework assignment from images provided by another teacher. Your native language is Uzbek, and you MUST provide all feedback and text exclusively in the Uzbek language.
Please analyze the provided image(s) containing math problems. Follow these steps:
1. Identify how many distinct math problems/questions are present in total across all images.
2. Transcribe each problem clearly.
3. Solve each problem step-by-step and provide the final correct answer. Use LaTeX enclosed in $ for inline math and $$ for block math (e.g. $x^2 + y^2 = z^2$).
4. Format the output in JSON.

Output the result in JSON format matching the schema.`;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.imageBase64,
      mimeType: img.mimeType,
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          ...imageParts,
          { text: promptString },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionCount: {
              type: Type.INTEGER,
              description: "The total number of distinct math problems found in the images.",
            },
            solutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problemNumber: { type: Type.INTEGER },
                  problemText: { type: Type.STRING },
                  solutionSteps: { type: Type.STRING },
                  finalAnswer: { type: Type.STRING }
                },
                required: ["problemNumber", "problemText", "solutionSteps", "finalAnswer"]
              },
              description: "The list of solved problems.",
            },
          },
          required: ["questionCount", "solutions"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Failed to get response from Gemini");
    }

    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Error analyzing teacher examples:", error);
    throw error;
  }
}

export async function evaluateHomework(images: { imageBase64: string, mimeType: string }[], taskReference?: any) {
  let promptString = `You are an expert mathematics teacher evaluating a student's homework submission. Your native language is Uzbek, and you MUST provide all feedback, explanations, and evaluations exclusively in the Uzbek language.\nThe student submitted a math problem.\n`;
  
  if (taskReference) {
    promptString += `\nHere is the reference material provided by the teacher for this specific homework task (including correct answers, expected question count, etc):\n${JSON.stringify(taskReference)}\n\nPlease ensure your grading strictly aligns with this reference material. 
CRITICAL RULES:
1. Compare the questions answered by the student with the problems in the reference material. If the student submitted completely different problems that are NOT part of the teacher's assignment, you MUST score it 0 and set the feedback exactly to: "Bu misollar uyga vazifada mavjud emas." Stop further grading if they are completely unrelated.
2. Compare the number of questions answered by the student with the 'questionCount' in the reference. If the student missed any questions, state clearly in the 'feedback' that they did not answer all questions (mentioning how many they answered vs how many were expected) and reduce the score accordingly.\n`;
  }

  promptString += `Please analyze the provided file(s) or image(s) of the student's work. Follow these steps:
1. Carefully transcribe the student's entire solution, line by line. Use LaTeX enclosed in $ for inline math and $$ for block math (e.g. $x^2 + y^2 = z^2$).
   - CRITICAL: Write each separate equation, mathematical step, or distinct line of text from the file on a NEW LINE in your transcription. Use double newlines between each line to ensure they render as separate blocks in Markdown. Do not run multiple steps or equations together on the same line.
2. Verify each step of the reasoning and calculation.
3. Determine the final answer the student arrived at.
4. Check if the final answer is correct and if all intermediate steps are logically and mathematically sound.
5. Provide a percentage score out of 100.
6. Provide constructive feedback entirely in Uzbek. If there are errors, explain precisely where the error occurred and how to fix it. Be encouraging but clear. If it is perfect, praise the student's work in Uzbek.
7. IMPORTANT FOR MULTIPLE FILES: If multiple files/images are provided, you MUST structure your \`transcription\`, \`feedback\`, and \`errorSteps\` to address each one separately. Start the section for each file with its number, like "1-fayl.\\n\\n[content for file 1]\\n\\n2-fayl.\\n\\n[content for file 2]" and so on.

IMPORTANT: 
- ALL text in the \`feedback\` and \`errorSteps\` fields MUST be written strictly in the UZBEK LANGUAGE. Do not use English.
- The \`transcription\` MUST use markdown formatting with LaTeX math enclosed in $ or $$. 
- Do not use bare LaTeX commands without enclosing them in $ or $$.

Output the result in JSON format matching the schema.`;

  let response;
  let retries = 5;
  let delayMs = 3000;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.imageBase64,
      mimeType: img.mimeType,
    }
  }));

  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            ...imageParts,
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
                description: "A percentage score from 0 to 100 evaluating the work.",
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
      const errorMsg = err.message || "";
      
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        throw new Error("API kaliti noto'g'ri. Iltimos, yaroqli Gemini API kalitini kiriting.");
      }
      
      const isTransient = errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED");
      
      if (!isTransient) {
        throw err;
      }
      
      retries--;
      
      if (retries === 0) {
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
  let result;
  try {
    result = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error("AI javobini o'qib bo'lmadi, iltimos qayta urining.");
  }

  return result;
}
