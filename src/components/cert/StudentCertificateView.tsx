import React, { useState, useEffect } from 'react';
import { Student, Group, CertExam, CertResult } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getStudentGroupIds } from '../../lib/certUtils';
import { CertExamTake } from './CertExamTake';
import { RaschStatsPanel } from './RaschStatsPanel';
import { 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  BarChart3, 
  AlertCircle, 
  Lock, 
  Trophy, 
  X,
  Loader2
} from 'lucide-react';

interface StudentCertificateViewProps {
  student: Student;
  groupDetails: Group[];
}

export const StudentCertificateView: React.FC<StudentCertificateViewProps> = ({
  student,
  groupDetails
}) => {
  const [exams, setExams] = useState<CertExam[]>([]);
  const [results, setResults] = useState<CertResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [takingExam, setTakingExam] = useState<CertExam | null>(null);
  const [statsModalExam, setStatsModalExam] = useState<CertExam | null>(null);

  const myGroupIds = getStudentGroupIds(student, groupDetails);

  // Listen to all exams and filter for student's groups
  useEffect(() => {
    const q = query(collection(db, 'cert_exams'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertExam));

      // Filter exams assigned to at least one of student's groups (or if groupIds empty)
      const myExams = all.filter(e => {
        if (!e.groupIds || e.groupIds.length === 0) return true;
        return e.groupIds.some(gid => myGroupIds.includes(gid));
      });

      myExams.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
        const timeB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
        return timeB - timeA;
      });

      setExams(myExams);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching exams for student:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [JSON.stringify(myGroupIds)]);

  // Listen to student's own submissions
  useEffect(() => {
    if (!student?.id) return;
    const q = query(collection(db, 'cert_results'), where('studentId', '==', student.id));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertResult));
      setResults(list);
    }, (err) => {
      console.error("Error fetching student cert_results:", err);
    });

    return () => unsubscribe();
  }, [student?.id]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-600/15">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase border border-white/20">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Milliy Sertifikat • O'quvchi Kabineti</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Matematika Milliy Sertifikat Imtihonlari
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm font-normal leading-relaxed">
            Rasch modeli asosida baholanuvchi 45 talik rasmiy sinovlar, individual T-shkala ballaringiz va OTM imtiyoz darajalari tahlili.
          </p>
        </div>
      </div>

      {/* Exams List */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Biriktirilgan Sertifikat Imtihonlari ({exams.length})
        </h2>

        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Imtihonlar yuklanmoqda...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Hozircha faol sertifikat imtihonlari yo'q
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              O'qituvchingiz g guruhingiz uchun yangi sinov imtihonini biriktirganda u shu yerda paydo bo'ladi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exams.map((exam) => {
              const myResult = results.find(r => r.examId === exam.id);
              const isSubmitted = Boolean(myResult);
              const isEnded = exam.status === 'ended';
              const canRetake = exam.allowedRetakes && exam.allowedRetakes.includes(student.id);

              // Extract finalized Rasch result from report
              const reportResult = exam.raschReport?.results?.find(
                (r: any) => r.studentId === student.id
              );

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                        isEnded
                          ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isEnded ? "Imtihon yakunlangan" : "Faol imtihon"}
                      </span>

                      {isSubmitted && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Topshirilgan</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {exam.title}
                    </h3>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Fan:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{exam.subject}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sana va vaqt:</span>
                        <span className="font-mono">{exam.date} • {exam.startTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Davomiyligi:</span>
                        <span>{exam.duration} daqiqa (45 ta topshiriq)</span>
                      </div>
                    </div>

                    {/* Outcome status banner */}
                    {isSubmitted && !isEnded && (
                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-200">
                        Topshirildi. Natijangiz barcha ishtirokchilar topshirib, imtihon yakunlangandan so'ng Rasch modeli orqali e'lon qilinadi.
                      </div>
                    )}

                    {isSubmitted && isEnded && reportResult && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            Sizning Rasch Natijangiz
                          </div>
                          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                            {reportResult.ball} <span className="text-xs text-slate-500 font-normal">ball</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {reportResult.correct} / {exam.raschReport?.stats?.numItems || 55} to'g'ri
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-3 py-1.5 rounded-xl text-base font-black border ${
                            reportResult.grade === 'A+' || reportResult.grade === 'A'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : reportResult.grade === 'B+' || reportResult.grade === 'B'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {reportResult.grade}
                          </span>
                          {reportResult.rank && (
                            <div className="text-[11px] text-slate-500 font-bold mt-1">
                              {reportResult.rank}-o'rin
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isSubmitted && isEnded && !reportResult && (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-700">
                        Natijangiz hisobotda topilmadi. O'qituvchingiz bilan bog'laning.
                      </div>
                    )}

                    {!isSubmitted && isEnded && (
                      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                        Imtihon yakunlangan. Siz bu imtihonni topshirmagansiz.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {(!isSubmitted || canRetake) && !isEnded && (
                      <button
                        onClick={() => setTakingExam(exam)}
                        className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Play className="w-4 h-4" />
                        <span>Imtihonni boshlash</span>
                      </button>
                    )}

                    {isSubmitted && isEnded && exam.raschReport && (
                      <button
                        onClick={() => setStatsModalExam(exam)}
                        className="w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Batafsil statistika va tahlil</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULLSCREEN EXAM TAKING MODAL */}
      {takingExam && (
        <CertExamTake
          exam={takingExam}
          student={student}
          onClose={() => setTakingExam(null)}
          onSubmitted={() => setTakingExam(null)}
        />
      )}

      {/* DETAILED STATS MODAL FOR STUDENT */}
      {statsModalExam && statsModalExam.raschReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Rasch modeli tahlili
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {statsModalExam.title}
                </h3>
              </div>
              <button
                onClick={() => setStatsModalExam(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <RaschStatsPanel 
                report={statsModalExam.raschReport} 
                highlightStudentId={student.id} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
