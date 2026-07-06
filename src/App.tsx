import React, { useState } from "react";
import { Uploader } from "./components/Uploader";
import { ResultCard } from "./components/ResultCard";
import { GradingResult } from "./types";
import { Calculator, Loader2 } from "lucide-react";

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [problemContext, setProblemContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setProblemContext("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert file to Base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: selectedFile.type,
          problemContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to evaluate homework. Please try again.");
      }

      const data: GradingResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Calculator className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Math AI Grader
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Upload student math homework for automated step-by-step verification and grading.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          {!result ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Student Homework Image
                  </label>
                  <Uploader
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onClear={handleClear}
                  />
                </div>

                <div>
                  <label
                    htmlFor="problemContext"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Original Problem / Context (Optional)
                  </label>
                  <textarea
                    id="problemContext"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-300 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="E.g., Solve for x: 2x^2 + 5x - 3 = 0"
                    value={problemContext}
                    onChange={(e) => setProblemContext(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Providing the original question helps the AI grade more accurately.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || isLoading}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    "Grade Homework"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ResultCard result={result} onReset={handleReset} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
