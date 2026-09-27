import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CertTest, CertQuestion } from '../../types';
import { MathAnswerField } from './MathAnswerField';
import { LatexRenderer } from './LatexRenderer';
import { createDefaultCertQuestions } from '../../lib/certUtils';
import { cleanForFirestore } from '../../lib/db';
import { recalculateCertificateExams } from '../../lib/certRecalculate';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { 
  X, 
  Save, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  Eye, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CertTestBuilderProps {
  test?: CertTest | null;
  mode: 'full' | 'fast' | 'special';
  teacherUsername: string;
  onClose: () => void;
  onSaved: (savedTest: CertTest) => void;
}

export const CertTestBuilder: React.FC<CertTestBuilderProps> = ({
  test,
  mode,
  teacherUsername,
  onClose,
  onSaved
}) => {
  const [title, setTitle] = useState(test?.title || '');
  const [questions, setQuestions] = useState<CertQuestion[]>(() => {
    if (test && test.questions && test.questions.length === 45) {
      return JSON.parse(JSON.stringify(test.questions));
    }
    return createDefaultCertQuestions();
  });

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [fullModeView, setFullModeView] = useState<'editor' | 'list' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal yopilganda yoki komponent unmount bo'lganda virtual klaviaturani yopish
  useEffect(() => {
    return () => {
      window.mathVirtualKeyboard?.hide();
    };
  }, []);

  const activeQuestion = questions[activeQIndex] || questions[0];

  const updateQuestion = (index: number, updates: Partial<CertQuestion>) => {
    setQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file); // server.ts: upload.single("file")
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Rasm yuklashda xatolik yuz berdi');
      const data = await res.json();
      if (data.url) {
        updateQuestion(activeQIndex, { imageUrl: data.url });
      }
    } catch (err: any) {
      alert(err.message || 'Rasm yuklanmadi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Iltimos, test nomini kiriting!");
      return;
    }

    try {
      setIsSaving(true);
      const testData: any = {
        title: title.trim(),
        mode,
        questions,
        teacherUsername,
        updatedAt: new Date().toISOString()
      };

      if (test?.id) {
        testData.id = test.id;
        await updateDoc(doc(db, 'cert_tests', test.id), cleanForFirestore(testData));
        // Kalit o'zgargan bo'lsa — shu testdagi barcha imtihon natijalari qayta baholanadi
        const changed = await recalculateCertificateExams({ ...test, ...testData });
        if (changed > 0) {
          alert(`Test saqlandi. ${changed} ta natija yangi kalit bo'yicha qayta baholandi.`);
        }
        onSaved({ ...test, ...testData });
      } else {
        testData.createdAt = new Date().toISOString();
        testData.status = 'active';
        testData.isEnded = false;
        testData.isClosed = false;
        const ref = await addDoc(collection(db, 'cert_tests'), cleanForFirestore(testData));
        testData.id = ref.id;
        onSaved(testData);
      }
      onClose();
    } catch (err) {
      console.error("Testni saqlashda xatolik:", err);
      alert("Testni saqlashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if a question is filled
  const isQuestionFilled = (q: CertQuestion) => {
    if (q.isOpenEnded) {
      return Boolean(q.subAnswers?.[0]?.correctAnswerText?.trim() && q.subAnswers?.[1]?.correctAnswerText?.trim());
    }
    return q.correctOptionIndex >= 0;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xs flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden animate-fadeIn">
      {/* Top Header */}
      <div className="p-3.5 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 shadow-xs z-10">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <input
            type="text"
            required
            placeholder="Test nomi (Masalan: 1-Variant: Rasmiy Namunaviy Test)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black ${
              mode === 'full' 
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : mode === 'fast'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}>
              {mode === 'full' ? "To'liq" : mode === 'fast' ? "Tezkor" : "Maxsus"}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
              {questions.filter(isQuestionFilled).length} / 45 to'ldirildi
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saqlanmoqda..." : "Saqlash"}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {mode === 'fast' || mode === 'special' ? (
        /* FAST & SPECIAL MODE: Comprehensive Answer Sheet Grid */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3 max-w-7xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>{mode === 'special' ? "Maxsus Test" : "Tezkor rejim"}:</strong> 1–32 gacha 4 ta variant (A–D), 33–35 gacha 6 ta variant (A–F), va 36–45 gacha ochiq a va b javoblarini kiriting.
              {mode === 'special' && " Ushbu test keyinchalik ochiq havola orqali istalgan kishiga yuboriladi."}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Part 1: Closed Questions 1 to 35 */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
                  1–35-savollar: Test kalitlari
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  1–32 (A–D) • 33–35 (A–F)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {questions.slice(0, 35).map((q, idx) => {
                  const opts = q.options || (idx >= 32 ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['A', 'B', 'C', 'D']);
                  const isSixOptions = idx >= 32;
                  return (
                    <div 
                      key={q.id}
                      className={`p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 ${
                        isSixOptions ? 'col-span-1 sm:col-span-2 bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-900/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-8 font-black text-xs font-mono text-slate-700 dark:text-slate-300">
                          {idx + 1}.
                        </span>
                        {isSixOptions && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            (6 variant)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                        {opts.map((optText, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isSelected = q.correctOptionIndex === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => updateQuestion(idx, { correctOptionIndex: optIdx })}
                              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Part 2: Open Questions 36 to 45 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
                  36–45-savollar: Ochiq qism (a va b)
                </h3>
                <span className="text-[11px] font-bold text-indigo-500">
                  Har biri 2 birlik
                </span>
              </div>

              <div className="space-y-3.5">
                {questions.slice(35, 45).map((q, localIdx) => {
                  const qIdx = 35 + localIdx;
                  return (
                    <div 
                      key={q.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
                    >
                      <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {qIdx + 1}-savol javoblari:
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500">a) qism to'g'ri javobi:</span>
                          <MathAnswerField
                            value={q.subAnswers?.[0]?.correctAnswerText || ''}
                            onChange={(val) => {
                              const currentB = q.subAnswers?.[1]?.correctAnswerText || '';
                              updateQuestion(qIdx, {
                                subAnswers: [
                                  { label: 'a', correctAnswerText: val },
                                  { label: 'b', correctAnswerText: currentB }
                                ]
                              });
                            }}
                            placeholder="Masalan: 3√7 / 7"
                          />
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-500">b) qism to'g'ri javobi:</span>
                          <MathAnswerField
                            value={q.subAnswers?.[1]?.correctAnswerText || ''}
                            onChange={(val) => {
                              const currentA = q.subAnswers?.[0]?.correctAnswerText || '';
                              updateQuestion(qIdx, {
                                subAnswers: [
                                  { label: 'a', correctAnswerText: currentA },
                                  { label: 'b', correctAnswerText: val }
                                ]
                              });
                            }}
                            placeholder="Masalan: 24"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FULL MODE: Responsive Question Editor with Tab Switcher on Mobile/Tablet */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Subheader view switcher on mobile & tablet */}
          <div className="xl:hidden flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFullModeView('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  fullModeView === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Savollar (1–45)
              </button>
              <button
                type="button"
                onClick={() => setFullModeView('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  fullModeView === 'editor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tahrirlash (#{activeQIndex + 1})
              </button>
              <button
                type="button"
                onClick={() => setFullModeView('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  fullModeView === 'preview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ko'rinish
              </button>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {activeQIndex + 1} / 45
            </div>
          </div>

          <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
            {/* Left Column: 1-45 Navigator */}
            <div className={`w-full xl:w-64 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto shrink-0 space-y-3 ${
              fullModeView === 'list' ? 'block' : 'hidden xl:block'
            }`}>
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Savollar (1–45)</span>
                <span className="text-[11px] font-normal text-slate-400">
                  {questions.filter(isQuestionFilled).length}/45 tayyor
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-9 xl:grid-cols-3 gap-2">
                {questions.map((q, idx) => {
                  const filled = isQuestionFilled(q);
                  const isActive = activeQIndex === idx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setActiveQIndex(idx);
                        setFullModeView('editor');
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl text-center text-xs font-bold transition-all relative cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : filled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <div>{idx + 1}</div>
                      <div className="text-[9px] opacity-75 font-normal truncate">
                        {idx < 32 ? '4 var' : idx < 35 ? '6 var' : 'Ochiq'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Middle Column: Active Question Editor */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 ${
              fullModeView === 'editor' ? 'block' : 'hidden xl:block'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {activeQIndex + 1}-savol ({activeQIndex < 32 ? '4 variantli' : activeQIndex < 35 ? '6 variantli' : 'Ochiq a/b'})
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Savol matni va parametrlari
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeQIndex === 0}
                    onClick={() => setActiveQIndex(prev => Math.max(0, prev - 1))}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Oldingi savol"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={activeQIndex === 44}
                    onClick={() => setActiveQIndex(prev => Math.min(44, prev + 1))}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Keyingi savol"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* LaTeX Question Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Savol matni (LaTeX formulalar $...$ yoki $$...$$ ichida):
                </label>
                <textarea
                  rows={4}
                  value={activeQuestion.text}
                  onChange={(e) => updateQuestion(activeQIndex, { text: e.target.value })}
                  placeholder="Masalan: $f(x) = x^3 - 3x^2 + 5$ funksiyaning $[0; 3]$ kesmadagi eng kichik qiymatini toping. (Formulalarni $...$ ichida yozing)"
                  className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Question Image Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Savol rasmi (ixtiyoriy):</span>
                  {activeQuestion.imageUrl && (
                    <button
                      type="button"
                      onClick={() => updateQuestion(activeQIndex, { imageUrl: '' })}
                      className="text-rose-500 hover:underline cursor-pointer text-xs"
                    >
                      Rasmni olib tashlash
                    </button>
                  )}
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... rasm havolasi yoki fayl yuklang"
                    value={activeQuestion.imageUrl || ''}
                    onChange={(e) => updateQuestion(activeQIndex, { imageUrl: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Yuklanmoqda..." : "Yuklash"}</span>
                  </button>
                </div>
              </div>

              {/* Options or Open Answers */}
              {!activeQuestion.isOpenEnded ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Javob variantlari (to'g'ri javobni tanlang):
                  </label>

                  <div className="space-y-2.5">
                    {activeQuestion.options.map((optText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = activeQuestion.correctOptionIndex === optIdx;

                      return (
                        <div 
                          key={optIdx}
                          className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuestion(activeQIndex, { correctOptionIndex: optIdx })}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {letter}
                          </button>

                          <input
                            type="text"
                            value={optText}
                            onChange={(e) => {
                              const newOptions = [...activeQuestion.options];
                              newOptions[optIdx] = e.target.value;
                              updateQuestion(activeQIndex, { options: newOptions });
                            }}
                            placeholder={`${letter} varianti matni...`}
                            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ochiq topshiriq to'g'ri kalitlari:
                  </label>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500">a) qism javobi (Formula/Son):</span>
                      <MathAnswerField
                        value={activeQuestion.subAnswers?.[0]?.correctAnswerText || ''}
                        onChange={(val) => {
                          const currentB = activeQuestion.subAnswers?.[1]?.correctAnswerText || '';
                          updateQuestion(activeQIndex, {
                            subAnswers: [
                              { label: 'a', correctAnswerText: val },
                              { label: 'b', correctAnswerText: currentB }
                            ]
                          });
                        }}
                        placeholder="Masalan: 3√7 / 7"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-500">b) qism javobi (Formula/Son):</span>
                      <MathAnswerField
                        value={activeQuestion.subAnswers?.[1]?.correctAnswerText || ''}
                        onChange={(val) => {
                          const currentA = activeQuestion.subAnswers?.[0]?.correctAnswerText || '';
                          updateQuestion(activeQIndex, {
                            subAnswers: [
                              { label: 'a', correctAnswerText: currentA },
                              { label: 'b', correctAnswerText: val }
                            ]
                          });
                        }}
                        placeholder="Masalan: 24"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Rendered Preview */}
            <div className={`w-full xl:w-80 2xl:w-96 bg-white dark:bg-slate-900 p-4 sm:p-6 overflow-y-auto shrink-0 space-y-4 ${
              fullModeView === 'preview' ? 'block' : 'hidden xl:block'
            }`}>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <Eye className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Jonli Ko'rinish</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {activeQIndex + 1}-topshiriq
                </div>

                <LatexRenderer content={activeQuestion.text} />

                {activeQuestion.imageUrl && (
                  <img
                    src={activeQuestion.imageUrl}
                    alt="Savol rasmi"
                    className="max-h-48 rounded-xl object-contain mx-auto border border-slate-200 dark:border-slate-800"
                  />
                )}

                {!activeQuestion.isOpenEnded ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    {activeQuestion.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = activeQuestion.correctOptionIndex === optIdx;

                      return (
                        <div 
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="w-5 font-bold shrink-0">{letter})</span>
                          <LatexRenderer content={opt} className="text-xs inline-block" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div><strong>a):</strong> {activeQuestion.subAnswers?.[0]?.correctAnswerText || '—'}</div>
                    <div><strong>b):</strong> {activeQuestion.subAnswers?.[1]?.correctAnswerText || '—'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
