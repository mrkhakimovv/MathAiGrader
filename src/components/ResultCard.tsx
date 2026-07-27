import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, Code, AlignLeft } from "lucide-react";
import { GradingResult } from "../types";

interface ResultCardProps {
  result: GradingResult;
  onReset: () => void;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const [isRawMode, setIsRawMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const isPerfect = result.isCorrect;
  const isPartial = result.isPartiallyCorrect && !isPerfect;
  const isIncorrect = !result.isCorrect && !result.isPartiallyCorrect;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      {/* Header Status */}
      <div
        className={`flex items-center gap-3 p-4 sm:p-6 transition-colors ${
          isPerfect
            ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400"
            : isPartial
            ? "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400"
            : "bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-400"
        }`}
      >
        {isPerfect && <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />}
        {isPartial && <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />}
        {isIncorrect && <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-500" />}
        
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {isPerfect
              ? "Perfect! All steps are correct."
              : isPartial
              ? "Partially Correct. Needs some adjustments."
              : "Incorrect. Let's review the steps."}
          </h2>
          <p className="text-sm opacity-80">
            Score: <span className="font-bold">{result.score}/10</span>
          </p>
        </div>
        <button
          onClick={onReset}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            isPerfect
              ? "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400"
              : isPartial
              ? "bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-400"
              : "bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-400"
          }`}
          title="Grade another"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
        <div className="flex justify-end gap-2">
          <button
            onClick={async () => {
              if (isDownloading) return;
              setIsDownloading(true);
              
              const content = document.getElementById("pdf-content");
              if (!content) {
                setIsDownloading(false);
                return;
              }

              // Create iframe
              const iframe = document.createElement('iframe');
              iframe.style.position = 'absolute';
              iframe.style.width = '800px';
              iframe.style.height = '100px'; // Initial height
              iframe.style.left = '-9999px';
              iframe.style.top = '0';
              document.body.appendChild(iframe);

              const doc = iframe.contentWindow?.document;
              if (!doc) {
                document.body.removeChild(iframe);
                setIsDownloading(false);
                return;
              }

              // Write clean content to iframe
              doc.open();
              doc.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Matematika Tahlil Natijasi</title>
                    <meta charset="utf-8">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous">
                    <style>
                      body {
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        color: #1e293b;
                        background-color: #ffffff;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                      }
                      .result-container {
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: #ffffff;
                      }
                      h1 {
                        font-size: 24px;
                        text-align: center;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 16px;
                        margin-top: 0;
                        margin-bottom: 24px;
                        color: #0f172a;
                      }
                      h3 {
                        font-size: 18px;
                        font-weight: 600;
                        margin-top: 24px;
                        margin-bottom: 12px;
                        color: #0f172a;
                      }
                      p { margin-bottom: 16px; }
                      ul { margin-bottom: 16px; padding-left: 24px; list-style-type: disc; }
                      li { margin-bottom: 8px; }
                      strong { font-weight: 600; color: #0f172a; }
                      
                      .text-slate-500, .text-slate-600 { color: #475569; }
                      .text-rose-500, .text-rose-800 { color: #e11d48; }
                      .bg-slate-50, .bg-white { background-color: #f8fafc; }
                      .bg-rose-50 { background-color: #fff1f2; }
                      .text-emerald-600 { color: #059669; }
                      .text-amber-600 { color: #d97706; }
                      
                      .katex-display {
                        margin: 1em 0;
                        overflow-x: auto;
                        overflow-y: hidden;
                      }
                      /* Ensure no weird box shadows or radius affecting print layout */
                      * { box-shadow: none !important; border-radius: 0 !important; }
                    </style>
                  </head>
                  <body>
                    <div class="result-container" id="pdf-container">
                      <h1>Matematika Tahlil Natijasi</h1>
                      ${content.innerHTML}
                    </div>
                  </body>
                </html>
              `);
              doc.close();

              iframe.onload = async () => {
                try {
                  const html2canvas = (await import('html2canvas')).default;
                  const { jsPDF } = await import('jspdf');

                  // Give enough time for KaTeX fonts to render completely
                  await new Promise(r => setTimeout(r, 600));

                  // Adjust iframe height to content height so it's fully visible for capture
                  const scrollHeight = doc.documentElement.scrollHeight;
                  iframe.style.height = (scrollHeight + 100) + 'px';

                  const container = doc.getElementById('pdf-container');
                  if (!container) throw new Error("Container not found");

                  const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    window: iframe.contentWindow || undefined
                  });

                  const imgData = canvas.toDataURL('image/jpeg', 0.95);
                  
                  const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                  });

                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = pdf.internal.pageSize.getHeight();
                  const imgProps = pdf.getImageProperties(imgData);
                  const margin = 10;
                  const printWidth = pdfWidth - (margin * 2);
                  const printHeight = (imgProps.height * printWidth) / imgProps.width;
                  
                  let heightLeft = printHeight;
                  let position = margin;

                  pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
                  heightLeft -= (pdfHeight - margin * 2);

                  while (heightLeft > 0) {
                    position = position - (pdfHeight - margin * 2);
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
                    heightLeft -= (pdfHeight - margin * 2);
                  }

                  // Download the file
                  pdf.save("tahlil-natijasi.pdf");
                } catch (error) {
                  console.error("PDF yaratishda xatolik:", error);
                  alert("PDF yuklab olishda xatolik yuz berdi.");
                } finally {
                  document.body.removeChild(iframe);
                  setIsDownloading(false);
                }
              };
            }}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <svg className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            )}
            {isDownloading ? "Tayyorlanmoqda..." : "Download PDF"}
          </button>
          <button
            onClick={() => setIsRawMode(!isRawMode)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
          >
            {isRawMode ? (
              <>
                <AlignLeft className="h-4 w-4" />
                Rendered View
              </>
            ) : (
              <>
                <Code className="h-4 w-4" />
                Raw LaTeX
              </>
            )}
          </button>
        </div>
        <div id="pdf-content" className="flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 bg-white dark:bg-slate-900">
        {/* Feedback Section */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Teacher's Feedback
          </h3>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 text-slate-800 dark:text-slate-200 overflow-x-auto transition-colors">
            {isRawMode ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-600 dark:text-slate-400">
                {result.feedback}
              </pre>
            ) : (
              <div className="markdown-body">
                <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                  {result.feedback}
                </Markdown>
              </div>
            )}
          </div>
        </div>

        {/* Error Steps (if any) */}
        {result.errorSteps && result.errorSteps.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">
              Identified Errors
            </h3>
            <ul className="flex flex-col gap-2">
              {result.errorSteps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 sm:px-4 py-3 text-sm text-rose-800 dark:text-rose-300 overflow-x-auto transition-colors"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span className="min-w-0">
                    {isRawMode ? (
                      <pre className="whitespace-pre-wrap font-mono text-sm inline-block text-rose-800 dark:text-rose-300">
                        {step}
                      </pre>
                    ) : (
                      <div className="markdown-body inline-block align-top">
                        <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                          {step}
                        </Markdown>
                      </div>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcription */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Transcription of Work
          </h3>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 overflow-x-auto transition-colors">
            {isRawMode ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-600 dark:text-slate-400">
                {result.transcription}
              </pre>
            ) : (
              <div className="markdown-body font-mono text-sm">
                <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                  {result.transcription}
                </Markdown>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
