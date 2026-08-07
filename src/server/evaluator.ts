import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// 1-TUZATISH: thinking sozlamalari
// analyze: o'qituvchi misollarini yechish - thinking o'chiq (tejamkorlik)
// evaluate: talaba ishini baholash - thinking CHEGARALANGAN.
//
//   ESKI QIYMAT: thinkingBudget: -1 (cheksiz/dynamic).
//   MUAMMO (real loglardan aniqlangan): -1 bilan model ba'zi
//   grading'larda 30,000-63,000 thinking token sarfladi. Bu:
//     (a) xarajatning ASOSIY manbai edi (javobdan 5-20x ko'p),
//     (b) gradingni BUZDI — thinking maxOutputTokens (65536) ichiga
//         kirgani uchun, 62k+ thinking bo'lganda javobga joy qolmay
//         JSON kesildi va "Javob juda uzun bo'lib ketdi" xatosi chiqdi.
//         Ya'ni maksimal pul + natija YO'Q.
//
//   YECHIM: 8192 token chegara. Bu har masalani chuqur tekshirishga
//   yetarli (aksar muvaffaqiyatli grading shundan kam ishlatgan),
//   lekin cheksiz "loop"ning oldini oladi. Natija: ~65-75% arzon +
//   ishonchli (grading doim tugaydi, xato bermaydi).
//
//   SOZLASH: Render loglaridagi [TOKENS] ... thinking: N qiymatlariga
//   qarab moslang. Agar sifat tushsa 12288 ga oshiring; agar hali
//   ham qimmat bo'lsa va sifat yaxshi bo'lsa 4096 ga tushiring.
const THINKING_ANALYZE = { thinkingBudget: 0 };
const THINKING_EVALUATE = { thinkingBudget: 8192 };

// ============================================================
// 4-TUZATISH: Output limitlari (faqat himoya chegarasi)
// Limit maksimal (65536) - o'qituvchi/o'quvchining haqiqiy javobi
// HECH QACHON kesilmaydi. Bu faqat model nazoratsiz loop'ga
// tushib qolgan favqulodda holatlarda ishlaydigan "xavfsizlik
// klapani". Amalda javoblar bundan ancha qisqa bo'ladi va
// faqat kerakli miqdorda token sarflanadi.
// ============================================================
const MAX_OUTPUT_ANALYZE = 65536; // maksimal - haqiqiy javob hech qachon kesilmaydi
const MAX_OUTPUT_EVALUATE = 65536; // maksimal - haqiqiy javob hech qachon kesilmaydi

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

// REFERENCE NORMALIZATSIYA:
// Reference ma'lumoti turli joyda bo'lishi mumkin:
//  - taskReference.solutions (to'g'ridan-to'g'ri)
//  - taskReference.teacherAnalysis.solutions (vazifa yaratishda shu tarzda saqlanadi!)
//  - taskReference.analysis.solutions (ehtimoliy variant)
// Bu funksiya solutions/questionCount ni QAYERDA bo'lsa ham topadi.
function normalizeReference(taskReference: any): { questionCount: number; solutions: any[] } | null {
  if (!taskReference) return null;

  // Mumkin bo'lgan joylarni tartib bilan tekshiramiz
  const candidates = [
    taskReference,
    taskReference.teacherAnalysis,
    taskReference.analysis,
    taskReference.reference,
  ];

  for (const cand of candidates) {
    if (cand && Array.isArray(cand.solutions) && cand.solutions.length > 0) {
      return {
        questionCount: cand.questionCount ?? cand.solutions.length,
        solutions: cand.solutions,
      };
    }
  }

  return null; // reference topilmadi (haqiqatan bo'sh)
}

// 2-TUZATISH: Reference siqish
function compactReference(taskReference: any): string | null {
  const ref = normalizeReference(taskReference);
  if (!ref) return null;

  const compact = {
    n: ref.questionCount,
    q: ref.solutions.map((sol: any) => ({
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
  errors: Array<{ problemNumber: number; mistake: string; isWarning?: boolean }>,
  taskReference?: any
): string[] {
  if (!errors || errors.length === 0) return [];

  // Reference'dan masala raqami -> yechim xaritasi
  // normalizeReference orqali solutions'ni qayerda bo'lsa ham topamiz
  const ref = normalizeReference(taskReference);
  const solutionMap = new Map<number, { steps: string; answer: string; text: string }>();
  if (ref?.solutions) {
    for (const sol of ref.solutions) {
      solutionMap.set(sol.problemNumber, {
        steps: sol.solutionSteps ?? "",
        answer: sol.finalAnswer ?? "",
        text: sol.problemText ?? "",
      });
    }
  }

  return errors.map((err) => {
    const sol = solutionMap.get(err.problemNumber);
    const prefix = err.isWarning ? "[WARNING] " : "";
    if (sol) {
      // Model izohiga reference'dagi tayyor yechimni SERVER qo'shadi (0 token!)
      return prefix + (
        `**${err.problemNumber}-masala.** ${err.mistake}\n\n` +
        `**To'g'ri yechim:**\n\n${sol.steps}\n\n` +
        `**Javob:** ${sol.answer}`
      );
    }
    // Reference'da bu raqam topilmasa — faqat model izohi
    return prefix + `**${err.problemNumber}-masala.** ${err.mistake}`;
  });
}

export async function analyzeTeacherExamples(images: { imageBase64: string, mimeType: string }[]) {
  const promptString = `You are an expert mathematics teacher analyzing a homework assignment from images provided by another teacher. Your native language is Uzbek, and you MUST provide all feedback and text exclusively in the Uzbek language.
Please analyze the provided image(s) containing math problems. Follow these steps carefully:

1. CRITICAL IMAGE READING: Look VERY CAREFULLY at the handwriting or printed text. Pay close attention to every sign (+, -, *, /), every exponent, every decimal point, and every parenthesis. Do NOT assume a number is what you expect it to be; read exactly what is written.
2. Identify how many distinct math problems/questions are present in total across all images.
3. Transcribe each problem clearly.
4. Solve each problem step-by-step and provide the final correct answer. Use LaTeX enclosed in $ for inline math and $$ for block math (e.g. $x^2 + y^2 = z^2$).
5. Format the output in JSON.

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
        thinkingConfig: THINKING_ANALYZE,
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

    // Limit tufayli kesilgan JSON'ni aniqlash
    const finishReason = response?.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      throw new Error("Misollar juda ko'p yoki uzun bo'lib ketdi. Iltimos, rasmlarni kamroq qilib (masalan 1 tadan) yoki soddaroq qilib yuboring.");
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Failed to get response from Gemini");
    }

    try {
      return JSON.parse(responseText);
    } catch (parseErr) {
      if (finishReason === "MAX_TOKENS") {
        throw new Error("Misollar juda ko'p bo'lib ketdi. Iltimos, rasmlarni kamroq qilib yuboring.");
      }
      throw new Error("AI javobini o'qib bo'lmadi, iltimos qayta urining.");
    }
  } catch (error: any) {
    console.error("Error analyzing teacher examples:", error);
    throw error;
  }
}

export async function evaluateHomework(images: { imageBase64: string, mimeType: string }[], taskReference?: any) {
  const normalizedRef = normalizeReference(taskReference);
  const hasReference = !!normalizedRef;

  // STATIK QISM (caching prefiksi)
  let promptString = `You are an expert mathematics teacher evaluating a student's homework submission. Your native language is Uzbek, and you MUST provide all feedback, explanations, and evaluations exclusively in the Uzbek language.
The student submitted a math problem.
Please analyze the provided image(s) of the student's work. Follow these steps carefully:

1. CRITICAL IMAGE READING: Students often write by hand, which can be messy. Look VERY CAREFULLY at every sign (+, -, *, /), every exponent, every decimal point, and every parenthesis. Do NOT assume a number is what you expect it to be; read exactly what is written. Take your time to double-check ambiguities.
2. Carefully transcribe the student's entire solution, line by line. Use LaTeX enclosed in $ for inline math and $$ for block math (e.g. $x^2 + y^2 = z^2$).
   - CRITICAL: Write each separate equation, mathematical step, or distinct line of text from the file on a NEW LINE in your transcription. Use double newlines between each line to ensure they render as separate blocks in Markdown. Do not run multiple steps or equations together on the same line.
3. Verify each step of the reasoning and calculation.
4. Determine the final answer the student arrived at.
5. Check if the final answer is correct and if all intermediate steps are logically and mathematically sound.
6. Provide a percentage score out of 100.
7. Provide constructive feedback entirely in Uzbek. Be encouraging but clear. If it is perfect, praise the student's work in Uzbek. DO NOT list the specific errors or mistakes in this feedback field. Keep this feedback general (e.g. praising effort, summarizing completeness). The specific errors will be collected in the 'errors' array and displayed separately.
8. IMPORTANT FOR MULTIPLE FILES: If multiple files/images are provided, you MUST structure your \`transcription\` and \`feedback\` to address each one separately. Start the section for each file with its number, like "1-fayl.\\n\\n[content for file 1]\\n\\n2-fayl.\\n\\n[content for file 2]" and so on.

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
2. MANDATORY COMPLETENESS CHECK (do this FIRST, before grading correctness):
   - Count how many DISTINCT problems from the reference the student actually answered. Call this A.
   - The expected total is 'n'.
   - The score MUST be capped by completeness: max possible score = round(100 * A / n).
   - In the feedback, ALWAYS state clearly in Uzbek: "Siz {n} ta masaladan {A} tasini yubordingiz." and list WHICH problem numbers are missing.
   - If problems are missing, the feedback MUST begin by pointing this out, before any praise.
3. For each evaluated question:
   - If the FINAL answer is WRONG: add an entry to 'errors' with problemNumber, mistake explanation, and set isWarning=false. Score MUST be reduced for this.
   - If the FINAL answer is CORRECT but there are minor logical flaws or steps missing: add an entry to 'errors' with problemNumber, explanation of the minor flaw, and set isWarning=true. DO NOT reduce the score for this question. It's just a warning.
   - Do NOT copy the full correct solution in 'mistake'.
4. Do NOT duplicate the specific errors or warnings in the 'feedback' field. The 'feedback' field should ONLY contain the completeness check and a general praise/encouragement.

Output the result in JSON format matching the schema.`;
  } else {
    // Reference yo'q rejim: model o'zi yechimni bilishi kerak,
    // shuning uchun bu rejimda izoh biroz kengroq bo'lishi mumkin
    promptString += `
For each evaluated question:
- If the FINAL answer is WRONG: add an entry to the 'errors' array with problemNumber, explanation in Uzbek, and set isWarning=false. Score MUST be reduced.
- If the FINAL answer is CORRECT but there are minor logical flaws: add an entry to the 'errors' array with problemNumber, explanation in Uzbek, and set isWarning=true. DO NOT reduce the score.

Do NOT duplicate the specific errors or warnings in the 'feedback' field. The 'feedback' field should ONLY contain a general praise/encouragement and an overall summary.

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
          thinkingConfig: THINKING_EVALUATE,
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
                description: "General constructive feedback for the student in Markdown format, in Uzbek. DO NOT list specific problem mistakes here. Just provide a general summary.",
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
                    isWarning: {
                      type: Type.BOOLEAN,
                      description: "True if the final answer is correct but there's a minor step flaw. False if the final answer is wrong.",
                    },
                  },
                  required: ["problemNumber", "mistake"],
                },
                description: "List of mistakes or warnings. Empty array if everything is perfect.",
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

  // 6-QO'SHIMCHA: real token sonini natijaga qo'shamiz (statistika uchun)
  const usage = response?.usageMetadata;
  result.inputTokens = usage?.promptTokenCount ?? 0;
  result.outputTokens = usage?.candidatesTokenCount ?? 0;

  return result;
}