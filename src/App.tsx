import React, { useState, useEffect } from "react";
import { Uploader } from "./components/Uploader";
import { ResultCard } from "./components/ResultCard";
import { SummarySection } from "./components/SummarySection";
import { GradingResult } from "./types";
import { Calculator, Loader2, Moon, Sun } from "lucide-react";

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [history, setHistory] = useState<GradingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to evaluate homework. Please try again.");
      }

      const data: GradingResult = await response.json();
      setResult(data);
      setHistory(prev => {
        const newHistory = [...prev, data];
        return newHistory.length > 50 ? newHistory.slice(newHistory.length - 50) : newHistory;
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-900 dark:text-slate-100 md:p-8 transition-colors">
      <div className="mx-auto max-w-3xl relative">
        <button
          onClick={toggleDarkMode}
          className="absolute right-0 top-0 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Header */}
        <header className="mb-10 text-center pt-8 md:pt-0">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
            <Calculator className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Math AI Grader
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Upload student math homework for automated step-by-step verification and grading.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          {!result ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 transition-colors">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Student Homework Image
                  </label>
                  <Uploader
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onClear={handleClear}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || isLoading}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none dark:focus:ring-offset-slate-950"
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
          
          {/* Summary Section */}
          <SummarySection history={history} />
        </main>
      </div>
    </div>
  );
}
