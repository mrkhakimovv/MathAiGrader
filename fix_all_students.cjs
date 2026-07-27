const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

const newImports = `import React, { useState } from 'react';
import { FilePlus, Library, Trash2, Users, Search, X, Check, Copy, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { GradingResult } from '../types';`;

code = code.replace(/import React, \{ useState \} from 'react';\nimport \{ FilePlus, Library, Trash2, Users, X, Check, Copy, ExternalLink \} from 'lucide-react';/, newImports);

const oldAllStudentsView = `interface AllStudentsViewProps {
  students: any[];
  onDeleteStudent: (index: number) => void;
}

export function AllStudentsView({ students, onDeleteStudent }: AllStudentsViewProps) {
  const handleDelete = (index: number, studentName: string) => {
    if (window.confirm(\`Rostdan ham "\${studentName}" o'quvchini o'chirmoqchimisiz?\`)) {
      onDeleteStudent(index);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Students</h2>
      </div>
      
      {students && students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <button
                onClick={() => handleDelete(index, \`\${student.firstName} \${student.lastName}\`)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
          <p className="text-slate-500 dark:text-slate-400">Hech qanday o'quvchi mavjud emas. Yuqoridagi "O'quvchi qo'shish" tugmasini bosib yangi o'quvchi qo'shing.</p>
        </div>
      )}
    </div>
  );
}`;

const newAllStudentsView = `interface AllStudentsViewProps {
  students: any[];
  onDeleteStudent: (index: number) => void;
  history?: GradingResult[];
}

export function AllStudentsView({ students, onDeleteStudent, history = [] }: AllStudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleDelete = (e: React.MouseEvent, index: number, studentName: string) => {
    e.stopPropagation();
    if (window.confirm(\`Rostdan ham "\${studentName}" o'quvchini o'chirmoqchimisiz?\`)) {
      onDeleteStudent(index);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const fullName = \`\${student.firstName} \${student.lastName}\`.toLowerCase();
    const group = (student.group || '').toLowerCase();
    return fullName.includes(query) || group.includes(query);
  });

  const getStudentStats = (student: any) => {
    // Note: This relies on history items having a student identifier or being mapped correctly.
    // If not mapped, we assume all history is global, but ideally it should filter by student username/id
    const studentHistory = history.filter(h => (h as any).studentId === student.id || (h as any).studentUsername === student.username || h.studentName === \`\${student.firstName} \${student.lastName}\`);
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
                onClick={(e) => handleDelete(e, index, \`\${student.firstName} \${student.lastName}\`)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-6 flex items-center gap-4 pr-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">O'quvchi statistikasi</p>
              </div>
            </div>

            {(() => {
              const stats = getStudentStats(selectedStudent);
              return (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Topshirgan vazifalar</div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalTasks}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">O'rtacha o'zlashtirish</div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgScore}%</div>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Oxirgi vazifalar tarixi</h4>
                  {stats.recentTasks.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentTasks.map((task: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <div className="flex items-center gap-3">
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
                            {task.score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg border-dashed">
                      Hali vazifa yuklanmagan
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(oldAllStudentsView, newAllStudentsView);
fs.writeFileSync('src/components/TeacherViews.tsx', code);
