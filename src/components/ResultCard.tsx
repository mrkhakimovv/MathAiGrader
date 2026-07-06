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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header Status */}
      <div
        className={`flex items-center gap-3 p-6 ${
          isPerfect
            ? "bg-emerald-50 text-emerald-900"
            : isPartial
            ? "bg-amber-50 text-amber-900"
            : "bg-rose-50 text-rose-900"
        }`}
      >
        {isPerfect && <CheckCircle2 className="h-8 w-8 text-emerald-600" />}
        {isPartial && <AlertCircle className="h-8 w-8 text-amber-600" />}
        {isIncorrect && <XCircle className="h-8 w-8 text-rose-600" />}
        
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          title="Grade another"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-end">
          <button
            onClick={() => setIsRawMode(!isRawMode)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
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
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Teacher's Feedback
          </h3>
          <div className="rounded-xl bg-slate-50 p-5 text-slate-800">
            {isRawMode ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-600">
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
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-rose-500">
              Identified Errors
            </h3>
            <ul className="flex flex-col gap-2">
              {result.errorSteps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <span>
                    {isRawMode ? (
                      <pre className="whitespace-pre-wrap font-mono text-sm inline-block">
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
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Transcription of Work
          </h3>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            {isRawMode ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-600">
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
