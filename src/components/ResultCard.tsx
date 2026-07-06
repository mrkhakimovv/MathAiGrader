import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
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
        <div className="flex justify-end">
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
                <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
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
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
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
                <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {result.transcription}
                </Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
