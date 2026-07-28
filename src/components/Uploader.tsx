import React, { useCallback, useRef, useState, useEffect } from "react";
import { UploadCloud, FileImage, X } from "lucide-react";
import { cn } from "../lib/utils";

interface UploaderProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onClear: () => void;
}

export function Uploader({ onFilesSelect, selectedFiles, onClear }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback((files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setErrorMsg("Faqat rasm yoki PDF fayllari qabul qilinadi");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Fayl hajmi juda katta. Iltimos, 10MB dan kichik fayl yuklang.");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelect([...selectedFiles, ...validFiles]);
    }
  }, [onFilesSelect, selectedFiles]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      validateAndSelect(e.clipboardData.files);
    }
  }, [validateAndSelect]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSelect(e.dataTransfer.files);
      }
    },
    [validateAndSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndSelect(e.target.files);
      }
    },
    [validateAndSelect]
  );

  const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    if (newFiles.length === 0) {
      onClear();
    } else {
      onFilesSelect(newFiles);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-8 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50",
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20"
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
        )}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400", isDragging && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400")}>
            <UploadCloud className="h-8 w-8" />
          </div>
          <div>
            <p className="text-base font-medium text-slate-900 dark:text-slate-100">
              Click to upload, drag and drop, or paste (Ctrl+V)
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              SVG, PNG, JPG, GIF or PDF (max. 10MB)
            </p>
          </div>
        </div>
      </div>
      {errorMsg && (
        <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {errorMsg}
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-4 relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <FileImage className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
