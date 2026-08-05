import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// 1-TUZATISH: thinking o'chirish
const THINKING_OFF = { thinkingBudget: 0 };

// ============================================================
// 4-TUZATISH: Output limitlari (himoya chegarasi)
// Model faqat kerakli miqdorda yozadi - bu limitlar "runaway"
// (nazoratsiz uzun javob) holatlarining oldini oladi.
// analyze: o'qituvchi 10+ masalani yechadi - kengroq limit
// evaluate: 3-tuzatishdan keyin javob qisqa - torroq limit
// ============================================================
const MAX_OUTPUT_ANALYZE = 8192;
const MAX_OUTPUT_EVALUATE = 4096;

// Token monitoring
function logUsage(label: string, response: any) {
  const u = response?.usageMetadata;
  if (u) {
    console.log(
      `[TOKENS] ${label} | input: ${u.promptTokenCount ?? 0} | ` +
      `cached: ${u.cachedContentTokenCount ?? 0} | ` +
      `output: ${u.candidatesTokenCount ?? 0} | ` +
      `thinking: ${u.thoughtsTokenCount ?? 0} | ` +
      `total: ${u.totalTokenCount ?? 0}`
    );
  }
}

// 2-TUZATISH: Reference siqish
function compactReference(taskReference: any): string | null {
  if (!taskReference) return null;

  const compact = {
    n: taskReference.questionCount ?? taskReference.solutions?.length ?? 0,
    q: (taskReference.solutions ?? []).map((sol: any) => ({
      i: sol.problemNumber,
      p: sol.problemText,
      a: sol.finalAnswer,
      s: sol.solutionSteps,
    })),
  };

  return JSON.stringify(compact);
}

// ============================================================
// 3-TUZATISH: errorSteps'ni SERVERDA yig'ish
// Model endi to'liq yechimni yozmaydi — faqat masala raqami va
// qisqa xato izohini qaytaradi. To'liq yechim reference'dan
// BEPUL olinadi (u allaqachon bizda bor!).
// ============================================================
function buildErrorSteps(
  errors: Array<{ problemNumber: number; mistake: string }>,
  taskReference?: any
): string[] {
  if (!errors || errors.length === 0) return [];

  // Reference'dan masala raqami -> yechim xaritasi
  const solutionMap = new Map<number, { steps: string; answer: string; text: string }>();
  if (taskReference?.solutions) {
    for (const sol of taskReference.solutions) {
      solutionMap.set(sol.problemNumber, {
        steps: sol.solutionSteps ?? "",
        answer: sol.finalAnswer ?? "",
        text: sol.problemText ?? "",
      });
    }
  }

  return errors.map((err) => {
    const sol = solutionMap.get(err.problemNumber);
    if (sol) {
      // Model izohiga reference'dagi tayyor yechimni SERVER qo'shadi (0 token!)
      return (
        `**${err.problemNumber}-masala.** ${err.mistake}\n\n` +
        `**To'g'ri yechim:**\n\n${sol.steps}\n\n` +
        `**Javob:** ${sol.answer}`
      );
    }
    // Reference'da bu raqam topilmasa — faqat model izohi
    return `**${err.problemNumber}-masala.** ${err.mistake}`;
  });
}

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
          { text: promptString },
          ...imageParts,
        ],
      },
      config: {
        thinkingConfig: THINKING_OFF,
        maxOutputTokens: MAX_OUTPUT_ANALYZE, // 4-TUZATISH
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

    logUsage("analyzeTeacherExamples", response);

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
  const hasReference = !!taskReference;

  // STATIK QISM (caching prefiksi)
  let promptString = `You are an expert mathematics teacher evaluating a student's homework submission. Your native language is Uzbek, and you MUST provide all feedback, explanations, and evaluations exclusively in the Uzbek language.
The student submitted a math problem.
Please analyze the provided image(s) of the student's work. Follow these steps:
1. Carefully transcribe the student's entire solution, line by line. Use LaTeX enclosed in $ for inline math and $$ for block math (e.g. $x^2 + y^2 = z^2$).
   - CRITICAL: Write each separate equation, mathematical step, or distinct line of text from the file on a NEW LINE in your transcription. Use double newlines between each line to ensure they render as separate blocks in Markdown. Do not run multiple steps or equations together on the same line.
2. Verify each step of the reasoning and calculation.
3. Determine the final answer the student arrived at.
4. Check if the final answer is correct and if all intermediate steps are logically and mathematically sound.
5. Provide a percentage score out of 100.
6. Provide constructive feedback entirely in Uzbek. Be encouraging but clear. If it is perfect, praise the student's work in Uzbek.
7. IMPORTANT FOR MULTIPLE FILES: If multiple files/images are provided, you MUST structure your \`transcription\` and \`feedback\` to address each one separately. Start the section for each file with its number, like "1-fayl.\\n\\n[content for file 1]\\n\\n2-fayl.\\n\\n[content for file 2]" and so on.

IMPORTANT:
- ALL text MUST be written strictly in the UZBEK LANGUAGE. Do not use English.
- The \`transcription\` MUST use markdown formatting with LaTeX math enclosed in $ or $$.
- Do not use bare LaTeX commands without enclosing them in $ or $$.
`;

  if (hasReference) {
    // 3-TUZATISH: modeldan yechim KO'CHIRISHNI so'ramaymiz —
    // faqat masala raqami va QISQA xato izohi
    promptString += `
Reference material from the teacher (compact JSON):
- n = total expected question count
- q = list of problems: i = problem number, p = problem text, a = correct final answer, s = correct solution steps

${compactReference(taskReference)}

Grading rules based on this reference:
1. If the student's submitted problems are NOT part of this reference at all, score 0 and set feedback exactly to: "Bu misollar uyga vazifada mavjud emas." Stop further grading.
2. If the student answered fewer questions than 'n', state in the feedback how many they answered vs expected, and reduce the score accordingly.
3. For each incorrectly answered question, add an entry to the 'errors' array with:
   - problemNumber: the problem number (matching 'i' in the reference)
   - mistake: a SHORT explanation (2-4 sentences in Uzbek) of exactly WHERE and WHY the student went wrong. Do NOT copy the full correct solution — it will be attached automatically. Only explain the mistake itself.

Output the result in JSON format matching the schema.`;
  } else {
    // Reference yo'q rejim: model o'zi yechimni bilishi kerak,
    // shuning uchun bu rejimda izoh biroz kengroq bo'lishi mumkin
    promptString += `
For each incorrectly answered question, add an entry to the 'errors' array with:
- problemNumber: the problem number
- mistake: an explanation in Uzbek of where the student went wrong, including the correct approach briefly.

Output the result in JSON format matching the schema.`;
  }

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
            { text: promptString },
            ...imageParts,
          ],
        },
        config: {
          thinkingConfig: THINKING_OFF,
          maxOutputTokens: MAX_OUTPUT_EVALUATE, // 4-TUZATISH
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
                description: "Constructive feedback for the student in Markdown format, in Uzbek. Address the student directly.",
              },
              // 3-TUZATISH: errorSteps (uzun matnlar) o'rniga
              // errors (qisqa strukturali obyektlar)
              errors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    problemNumber: {
                      type: Type.INTEGER,
                      description: "The number of the problem where the mistake was made.",
                    },
                    mistake: {
                      type: Type.STRING,
                      description: "SHORT explanation (2-4 sentences, Uzbek, Markdown+LaTeX) of where and why the student went wrong. Do NOT include the full correct solution.",
                    },
                  },
                  required: ["problemNumber", "mistake"],
                },
                description: "List of mistakes. Empty array if everything is correct.",
              },
            },
            required: ["transcription", "isCorrect", "isPartiallyCorrect", "score", "feedback", "errors"],
          },
        },
      });
      logUsage("evaluateHomework", response);
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

  // 4-TUZATISH: limit tufayli kesilgan javobni aniqlash
  const finishReason = response?.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    console.warn("[WARN] Javob maxOutputTokens limitiga yetdi - JSON kesilgan bo'lishi mumkin");
  }

  const jsonStr = response?.text?.trim() || "{}";
  let result;
  try {
    result = JSON.parse(jsonStr);
  } catch (e) {
    if (finishReason === "MAX_TOKENS") {
      throw new Error("Javob juda uzun bo'lib ketdi. Iltimos, rasmlarni kamroq qilib yoki bitta-bitta yuboring.");
    }
    throw new Error("AI javobini o'qib bo'lmadi, iltimos qayta urining.");
  }

  // ============================================================
  // 3-TUZATISH (yakuniy qadam): errorSteps'ni serverda yig'amiz.
  // Frontend eski formatni (errorSteps: string[]) kutadi —
  // shuning uchun frontendni O'ZGARTIRISH SHART EMAS.
  // ============================================================
  const errors = Array.isArray(result.errors) ? result.errors : [];
  result.errorSteps = buildErrorSteps(errors, taskReference);
  delete result.errors; // ichki maydonni frontendga chiqarmaymiz

  return result;
}