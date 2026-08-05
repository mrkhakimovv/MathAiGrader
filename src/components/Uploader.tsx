import React, { useCallback, useRef, useState, useEffect } from "react";
import { UploadCloud, FileImage, X, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface UploaderProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onClear: () => void;
}

// ============================================================
// 5-TUZATISH: Rasm siqish
// Matematika vazifasi uchun 1280px kenglik yetarli.
// 4K rasm (~1500 token) -> 1280px JPEG (~450 token)
// Input tokenlar har rasmda ~50-70% kamayadi.
// ============================================================
const MAX_DIMENSION = 1280;   // eng katta tomon (px)
const JPEG_QUALITY = 0.85;    // sifat (0.85 = matn aniq o'qiladi)

async function compressImage(file: File): Promise<File> {
  // PDF va rasm bo'lmagan fayllar - tegmaymiz
  if (!file.type.startsWith("image/")) return file;
  // GIF animatsiya bo'lishi mumkin, SVG vektorli - tegmaymiz
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1);

    // Agar rasm allaqachon kichik va JPEG bo'lsa - siqish shart emas
    if (scale >= 1 && (file.type === "image/jpeg") && file.size < 500 * 1024) {
      bitmap.close();
      return file;
    }

    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file; // canvas ishlamasa - originalni yuboramiz
    }

    // Oq fon (PNG shaffofligi JPEG'da qora bo'lib qolmasligi uchun)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );

    if (!blob) return file;

    // Siqilgan versiya kattaroq chiqib qolsa (kamdan-kam) - originalni olamiz
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (e) {
    console.warn("Rasm siqishda xatolik, original yuboriladi:", e);
    return file; // xato bo'lsa - originalni yuboramiz, jarayon to'xtamaydi
  }
}

export function Uploader({ onFilesSelect, selectedFiles, onClear }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(async (files: FileList | File[]) => {
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
      // 5-TUZATISH: har rasmni parallel siqamiz
      setIsCompressing(true);
      try {
        const compressed = await Promise.all(validFiles.map(compressImage));
        onFilesSelect([...selectedFiles, ...compressed]);
      } finally {
        setIsCompressing(false);
      }
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
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4 text-center">
          <div className={cn("flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400", isDragging && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400")}>
            {isCompressing ? (
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6 md:h-8 md:w-8" />
            )}
          </div>
          <div className="px-2">
            <p className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-100">
              {isCompressing ? "Rasmlar tayyorlanmoqda..." : "Click to upload, drag and drop, or paste (Ctrl+V)"}
            </p>
            <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
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
