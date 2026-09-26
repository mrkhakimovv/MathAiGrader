import React, { useState } from 'react';
import { CertTest, CertExam, Group } from '../../types';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { cleanForFirestore } from '../../lib/db';
import { 
  dedupeBestAttempts, 
  computeRaschReport, 
  computeRaschWithReference 
} from '../../lib/rasch';
import { 
  itemDifficultiesFromMatrix, 
  generateSyntheticMatrix, 
  seedFromString 
} from '../../lib/synthetic';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  Sparkles, 
  Loader2, 
  Layers 
} from 'lucide-react';

interface AssignOrEditExamModalProps {
  test?: CertTest | null;
  examToEdit?: CertExam | null;
  teacherUsername: string;
  groups: Group[];
  onClose: () => void;
  onSaved: (exam: CertExam) => void;
}

export const AssignOrEditExamModal: React.FC<AssignOrEditExamModalProps> = ({
  test,
  examToEdit,
  teacherUsername,
  groups,
  onClose,
  onSaved
}) => {
  const isEditing = Boolean(examToEdit);

  const [title, setTitle] = useState(
    examToEdit?.title || (test ? `${test.title} imtihoni` : "Milliy Sertifikat Imtihoni")
  );
  const [subject, setSubject] = useState(examToEdit?.subject || "Matematika");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    examToEdit?.groupIds || (groups.length > 0 ? [groups[0].id] : [])
  );
  const [date, setDate] = useState(
    examToEdit?.date || new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(
    examToEdit?.startTime || "09:00"
  );
  const [duration, setDuration] = useState<number>(
    examToEdit?.duration || 120
  );
  const [syntheticEnabled, setSyntheticEnabled] = useState(
    examToEdit?.syntheticEnabled ?? true
  );
  const [syntheticCount, setSyntheticCount] = useState<number>(
    examToEdit?.syntheticCount ?? 10000
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGroupIds.length === groups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(groups.map(g => g.id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Iltimos, imtihon nomini kiriting!");
      return;
    }
    if (selectedGroupIds.length === 0) {
      alert("Kamida bitta guruhni tanlashingiz kerak!");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
      const groupNames = selectedGroups.map(g => g.name);

      const examData: any = {
        title: title.trim(),
        subject: subject.trim(),
        groupIds: selectedGroupIds,
        groupNames,
        date,
        startTime,
        duration: Number(duration) || 120,
        syntheticEnabled,
        syntheticCount: syntheticEnabled ? (Number(syntheticCount) || 10000) : 0,
        teacherUsername
      };

      if (isEditing && examToEdit) {
        examData.id = examToEdit.id;
        const synthChanged = 
          examToEdit.syntheticEnabled !== syntheticEnabled || 
          examToEdit.syntheticCount !== examData.syntheticCount;

        await updateDoc(doc(db, 'cert_exams', examToEdit.id), cleanForFirestore(examData));

        // If exam was already ended and synthetic setting changed, recompute report automatically
        if (examToEdit.status === 'ended' && synthChanged) {
          const resQuery = query(collection(db, 'cert_results'), where('examId', '==', examToEdit.id));
          const snap = await getDocs(resQuery);
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          const valid = list.filter(r => r.raschItems && r.raschItems.length > 0);
          const deduped = dedupeBestAttempts(valid);

          if (deduped.length > 0) {
            const targetLen = deduped[0].raschItems.length;
            const matrix = deduped
              .filter(r => r.raschItems.length === targetLen)
              .map(r => ({
                studentId: r.studentId,
                studentName: r.studentName,
                items: r.raschItems
              }));

            let report = null;
            if (syntheticEnabled && examData.syntheticCount > 0) {
              const difficulties = itemDifficultiesFromMatrix(matrix);
              const synthetic = generateSyntheticMatrix(difficulties, {
                count: examData.syntheticCount,
                seed: seedFromString(examToEdit.id)
              });
              report = computeRaschWithReference(matrix, synthetic, false);
            } else {
              report = computeRaschReport(matrix);
            }

            await updateDoc(doc(db, 'cert_exams', examToEdit.id), {
              raschReport: report
            });
            examData.raschReport = report;
          }
        }

        onSaved({ ...examToEdit, ...examData });
      } else if (test) {
        examData.testId = test.id;
        examData.status = 'active';
        examData.createdAt = new Date().toISOString();
        examData.allowedRetakes = [];

        const ref = await addDoc(collection(db, 'cert_exams'), cleanForFirestore(examData));
        examData.id = ref.id;
        onSaved(examData);
      }

      onClose();
    } catch (err) {
      console.error("Error saving exam:", err);
      alert("Imtihonni saqlashda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? "Imtihonni Tahrirlash" : "Imtihon Sifatida Biriktirish"}
              </h3>
              <p className="text-xs text-slate-500">
                {test ? test.title : examToEdit?.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Imtihon nomi:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Fan:
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Groups Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Biriktiriladigan Guruhlar:
              </label>
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  {selectedGroupIds.length === groups.length ? "Tanlovni bekor qilish" : "Barchasini belgilash"}
                </button>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-700 dark:text-amber-300">
                Hozircha guruhlar mavjud emas. Avval guruh qo'shing.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                {groups.map((g) => {
                  const isChecked = selectedGroupIds.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors text-xs font-medium ${
                        isChecked 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-bold'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGroup(g.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate">{g.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sana:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Boshlanish vaqti:
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Davomiylik (daqiqa):
              </label>
              <input
                type="number"
                min={10}
                max={300}
                required
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Synthetic Students Configuration */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Qo'shimcha (sintetik) o'quvchilar qo'shish
                </span>
              </div>
              <input
                type="checkbox"
                checked={syntheticEnabled}
                onChange={(e) => setSyntheticEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Real o'quvchilar soni kam bo'lsa ham, Rasch modeli parametrlari barqaror bo'lishi uchun 10 000 ta kalibrlangan tayanch natija bilan birgalikda baholanadi.
            </p>

            {syntheticEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Tayanch o'quvchilar soni:
                </span>
                <input
                  type="number"
                  min={100}
                  max={50000}
                  step={500}
                  value={syntheticCount}
                  onChange={(e) => setSyntheticCount(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isEditing ? "O'zgarishlarni saqlash" : "Imtihonni yaratish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
