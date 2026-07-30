import React, { useState } from 'react';
import { Users, UserPlus, FilePlus, Library, Trash2, X, Copy, Check, ExternalLink, Search, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GradingResult } from '../types';

interface AllStudentsViewProps {
  students: any[];
  onDeleteStudent: (student: any) => void;
  history?: GradingResult[];
}

export function AllStudentsView({ students, onDeleteStudent, history = [] }: AllStudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  const handleDelete = (e: React.MouseEvent, student: any) => {
    e.stopPropagation();
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const group = (student.group || '').toLowerCase();
    return fullName.includes(query) || group.includes(query);
  });

  const getStudentStats = (student: any) => {
    // Note: This relies on history items having a student identifier or being mapped correctly.
    // If not mapped, we assume all history is global, but ideally it should filter by student username/id
    const rawHistory = history.filter(h => (h as any).studentId === student.id || (h as any).studentUsername === student.username || (h as any).studentName === `${student.firstName} ${student.lastName}`);
    
    // Group by taskId and take the highest score
    const uniqueHistoryMap = new Map();
    rawHistory.forEach(h => {
      const key = h.taskId || h.createdAt || Math.random().toString();
      if (!uniqueHistoryMap.has(key) || uniqueHistoryMap.get(key).score < h.score) {
        uniqueHistoryMap.set(key, h);
      }
    });
    const studentHistory = Array.from(uniqueHistoryMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const totalTasks = studentHistory.length;
    const avgScore = totalTasks > 0 ? studentHistory.reduce((acc, curr) => acc + curr.score, 0) / totalTasks : 0;
    
    return {
      totalTasks,
      avgScore: Math.round(avgScore),
      recentTasks: studentHistory.slice(0, 5) // Get 5 most recent
    };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Students</h2>
        </div>
        
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="Ism, familiya yoki guruh bo'yicha qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredStudents && filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedStudent(student)}
              className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <button
                onClick={(e) => handleDelete(e, student)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                title="O'quvchini o'chirish"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pr-8">{student.firstName} {student.lastName}</h3>
              <div className="space-y-2 mt-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Telefon:</span>
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Guruh:</span>
                  <span>{student.group}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm text-center py-12">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Hech qanday o'quvchi topilmadi.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Haqiqatdan ham o'chirishni xohlaysizmi?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Siz "{studentToDelete.firstName} {studentToDelete.lastName}" akkauntini butunlay o'chirib yuboryapsiz. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-8 duration-300">
          <div className="relative flex-1 w-full max-w-5xl mx-auto overflow-y-auto flex flex-col p-6 sm:p-10">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute right-6 top-6 sm:right-10 sm:top-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-8 flex items-center gap-4 pr-10 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">O'quvchi statistikasi</p>
              </div>
            </div>

            {(() => {
              const stats = getStudentStats(selectedStudent);
              return (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-2 gap-6 mb-8 shrink-0">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Topshirgan vazifalar</div>
                      <div className="text-4xl font-bold text-slate-900 dark:text-white">{stats.totalTasks}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">O'rtacha o'zlashtirish</div>
                      <div className="text-4xl font-bold text-slate-900 dark:text-white">{stats.avgScore} <span className="text-2xl text-slate-400">/ 100</span></div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Oxirgi vazifalar tarixi</h4>
                    {stats.recentTasks.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentTasks.map((task: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                              {task.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : task.isPartiallyCorrect ? (
                              <CheckCircle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-rose-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {task.createdAt && task.createdAt.toDate ? task.createdAt.toDate().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('uz-UZ')}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">
                                {task.transcription || "Topshiriq..."}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {task.score} / 100
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <FilePlus className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Hali vazifa yuklanmagan</p>
                    </div>
                  )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export function CreateGroupView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <UserPlus className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Group</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <p className="text-slate-500 dark:text-slate-400">Group creation form will go here.</p>
      </div>
    </div>
  );
}

interface CreateTaskViewProps {
  onCreateTask: (task: any) => void;
  groups: string[];
  isSubmitting?: boolean;
  uploadProgress?: number;
}

export function CreateTaskView({ onCreateTask, groups, isSubmitting = false, uploadProgress = 0 }: CreateTaskViewProps) {
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [examples, setExamples] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyzeExamples = async () => {
    if (examples.length === 0) return;
    setIsAnalyzing(true);
    try {
      const imagesData = await Promise.all(examples.map(async (file) => {
        return new Promise<{ imageBase64: string, mimeType: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            resolve({
              imageBase64: result,
              mimeType: file.type
            });
          };
          reader.onerror = error => reject(error);
        });
      }));

      const res = await fetch("/api/analyze-teacher-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Tahlil qilishda xatolik yuz berdi");
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Iltimos, vazifa sarlavhasini kiriting.");
      return;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      const start = startDate ? new Date(startDate) : new Date();
      if (end.getTime() <= start.getTime()) {
        alert("Tugash muddati boshlanish muddatidan yoki joriy vaqtdan keyin bo'lishi kerak.");
        return;
      }
    }

    onCreateTask({
      title,
      group,
      startDate,
      endDate,
      files,
      examples,
      teacherAnalysis: analysisResult,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFilesState: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFilesState(prev => [...prev, ...newFiles]);
    }
  };

  const nowString = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <FilePlus className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vazifa yaratish</h2>
      </div>

      {isSubmitting && (
        <div className="mb-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Yuklanmoqda...</span>
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <form id="create-task-form" className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vazifa sarlavhasi <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
              placeholder="Masalan: 1-chorak yakuniy nazorat" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Guruhni tanlang (Ixtiyoriy)</label>
            <select 
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Uyga vazifa shartlari / misollar (Ixtiyoriy)</label>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">AI o'qituvchi ushbu misollarni o'zi ishlab tayyor holatga keltiradi va o'quvchilar javobini shunga asosan tekshiradi. Rasmlarni bu yerga Ctrl+V bilan ham qo'shishingiz mumkin.</p>
            <div 
              className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-6 py-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              tabIndex={0}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                const pastedFiles: File[] = [];
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                      pastedFiles.push(file);
                    }
                  }
                }
                if (pastedFiles.length > 0) {
                  setExamples(prev => [...prev, ...pastedFiles]);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  setExamples(prev => [...prev, ...droppedFiles]);
                }
              }}
            >
              <div className="text-center">
                <FilePlus className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400 justify-center">
                  <label htmlFor="examples-upload" className="relative cursor-pointer rounded-md font-semibold text-indigo-600 dark:text-indigo-400 focus-within:outline-none hover:text-indigo-500">
                    <span>Fayl yuklash</span>
                    <input id="examples-upload" name="examples-upload" type="file" multiple accept="image/*,.pdf" className="sr-only" onChange={(e) => handleFileChange(e, setExamples)} />
                  </label>
                  <p className="pl-1">yoki shu yerga tashlang</p>
                </div>
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">PNG, JPG, PDF</p>
                {examples.length > 0 && (
                  <div className="mt-4 w-full">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">{examples.length} ta fayl tanlandi</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2 justify-items-center">
                      {examples.map((file, i) => (
                        <div key={i} className="relative group w-full aspect-square border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={file.name || 'Pasted image'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-500">
                              <FilePlus className="h-8 w-8 mb-2" />
                              <span className="text-xs truncate w-full text-center">{file.name || 'Fayl'}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExamples(prev => prev.filter((_, index) => index !== i));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="text-rose-500 hover:text-rose-600 underline mt-4 text-xs" onClick={(e) => { e.stopPropagation(); setExamples([]); }}>Barchasini o'chirish</button>
                  </div>
                )}
              </div>
            </div>
            {examples.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAnalyzeExamples}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Tahlil qilinmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            )}
            
            {analysisResult && (
              <div className="mt-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">Tahlil natijasi:</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">
                  Jami savollar soni: <span className="font-bold">{analysisResult.questionCount}</span> ta
                </p>
                <div className="space-y-4">
                  {analysisResult.solutions.map((sol: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="font-semibold text-slate-900 dark:text-white mb-2">
                        {sol.problemNumber}-savol
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">
                        {sol.problemText}
                      </div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Yechim:</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-2">
                        {sol.solutionSteps}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Javob: {sol.finalAnswer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

interface AllGroupsViewProps {
  groups: any[];
  onDeleteGroup: (index: number) => void;
  students?: any[];
  history?: GradingResult[];
  tasks?: any[];
  onDeleteTask?: (task: any) => void;
}

export function AllGroupsView({ groups, onDeleteGroup, students = [], history = [], tasks = [], onDeleteTask }: AllGroupsViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ index: number, name: string } | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'tasks' | 'all-students'>('students');

  const handleDelete = (e: React.MouseEvent, index: number, groupName: string) => {
    e.stopPropagation();
    setGroupToDelete({ index, name: groupName });
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      onDeleteGroup(groupToDelete.index);
      if (selectedGroup?.name === groupToDelete.name) {
        setSelectedGroup(null);
      }
      setGroupToDelete(null);
    }
  };

  const confirmTaskDelete = () => {
    if (taskToDelete && onDeleteTask) {
      onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const getReferralLink = (group: any) => {
    // If group has an ID in DB, use that, otherwise fallback to group name URL encoded
    const id = group.id || encodeURIComponent(group.name);
    return `${window.location.origin}/register/${id}`;
  };

  const handleCopyLink = () => {
    if (!selectedGroup) return;
    navigator.clipboard.writeText(getReferralLink(selectedGroup));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGroupStudents = () => {
    if (!selectedGroup) return [];
    const groupStudents = students.filter(s => s.group === selectedGroup.name);
    return groupStudents.map(student => {
      const rawHistory = history.filter(h => h.studentUsername === student.username);
      
      const uniqueHistoryMap = new Map();
      rawHistory.forEach(h => {
        const key = h.taskId || h.createdAt || Math.random().toString();
        if (!uniqueHistoryMap.has(key) || uniqueHistoryMap.get(key).score < h.score) {
          uniqueHistoryMap.set(key, h);
        }
      });
      const studentHistory = Array.from(uniqueHistoryMap.values());

      const averageScore = studentHistory.length > 0 
        ? studentHistory.reduce((sum, r) => sum + r.score, 0) / studentHistory.length 
        : 0;
      return {
        ...student,
        averageScore,
        tasksCompleted: studentHistory.length
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  };

  const groupStudents = getGroupStudents();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <Library className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Groups</h2>
      </div>
      
      {groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedGroup(group)}
              className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <button
                onClick={(e) => handleDelete(e, index, group.name)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                title="Guruhni o'chirish"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pr-8">{group.name}</h3>
              <div className="space-y-2 mt-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Kunlari:</span>
                  <span>{group.days}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Soati:</span>
                  <span>{group.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm text-center py-12">
          <Library className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Hech qanday guruh mavjud emas. Yuqoridagi "Guruh yaratish" tugmasini bosib yangi guruh qo'shing.</p>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {groupToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Haqiqatdan ham o'chirishni xohlaysizmi?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Siz "{groupToDelete.name}" guruhini butunlay o'chirib yuboryapsiz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGroupToDelete(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Haqiqatdan ham o'chirishni xohlaysizmi?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Siz "{taskToDelete.title}" vazifasini butunlay o'chirib yuboryapsiz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmTaskDelete}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-8 duration-300">
          <div className="relative flex-1 w-full max-w-5xl mx-auto overflow-y-auto flex flex-col p-6 sm:p-10">
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute right-6 top-6 sm:right-10 sm:top-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-6 flex items-center gap-4 pr-10 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Guruh ma'lumotlari va reytingi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
              <div className="space-y-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Kunlari:</div>
                  <div className="col-span-2 text-sm font-medium text-slate-900 dark:text-slate-200">{selectedGroup.days}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Soati:</div>
                  <div className="col-span-2 text-sm font-medium text-slate-900 dark:text-slate-200">{selectedGroup.time}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">O'quvchilar:</div>
                  <div className="col-span-2 text-sm font-medium text-slate-900 dark:text-slate-200">{groupStudents.length} ta</div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  O'quvchilar uchun ro'yxatdan o'tish havolasi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Ushbu havolani yuborish orqali o'quvchilarni guruhga qo'shishingiz mumkin.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 truncate rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 select-all font-mono">
                    {getReferralLink(selectedGroup)}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col min-h-0">
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 gap-6 shrink-0">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                    activeTab === 'students' 
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  O'quvchilar va reyting
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                    activeTab === 'tasks' 
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Guruh vazifalari
                </button>
                <button
                  onClick={() => setActiveTab('all-students')}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                    activeTab === 'all-students' 
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Barcha o'quvchilar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === 'students' && (
                  groupStudents.length > 0 ? (
                    <div className="space-y-3">
                      {groupStudents.map((student, idx) => (
                        <div 
                          key={student.id || idx}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${
                              idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                              idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/50 dark:text-slate-300' :
                              idx === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400' :
                              'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{student.firstName} {student.lastName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {student.tasksCompleted} ta vazifa bajarilgan
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {student.averageScore > 0 ? student.averageScore.toFixed(1) : 0} ball
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              o'rtacha ko'rsatkich
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Bu guruhda hozircha o'quvchilar yo'q</p>
                    </div>
                  )
                )}

                {activeTab === 'tasks' && (
                  (() => {
                    const groupTasks = tasks.filter(t => t.group === selectedGroup?.name || !t.group || t.group === 'Barcha guruhlar' || t.group === '');
                    return groupTasks.length > 0 ? (
                      <div className="space-y-3">
                        {groupTasks.map((task, idx) => (
                          <div 
                            key={task.id || idx}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <FilePlus className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>Berilgan: {task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}</span>
                                  <span>•</span>
                                  <span>Tugash: {task.endDate ? new Date(task.endDate).toLocaleDateString() : '-'}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
                                {task.examples?.length || 0} ta misol
                              </span>
                              {onDeleteTask && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(task);
                                  }}
                                  className="text-slate-400 hover:text-red-500 transition-colors rounded-full p-2 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <FilePlus className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Bu guruh uchun hozircha vazifalar berilmagan</p>
                      </div>
                    );
                  })()
                )}

                {activeTab === 'all-students' && (
                  (() => {
                    const allStudents = students.filter(s => s.group === selectedGroup?.name);
                    return allStudents.length > 0 ? (
                      <div className="space-y-3">
                        {allStudents.map((student, idx) => (
                          <div 
                            key={student.id || idx}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                                {student.firstName?.charAt(0) || ''}{student.lastName?.charAt(0) || ''}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{student.firstName} {student.lastName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Username: <span className="font-mono">{student.username}</span> • Parol: <span className="font-mono">{student.password}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Bu guruhda hozircha o'quvchilar yo'q</p>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
