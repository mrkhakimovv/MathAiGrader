import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import React, { useState } from 'react';
import { Users, User, UserPlus, FilePlus, Library, Trash2, X, Copy, Check, ExternalLink, Search, Calendar, CheckCircle, XCircle, Loader2, FolderPlus, Edit2, Clock, Download, AlertCircle } from 'lucide-react';
import { GradingResult } from '../types';
import * as XLSX from 'xlsx';
import { EditGroupModal } from './EditGroupModal';
import { getAvatarUrl } from '../lib/utils';

interface AllStudentsViewProps {
  students: any[];
  onDeleteStudent: (student: any) => void;
  history?: GradingResult[];
  groups?: string[];
  onUpdateStudentGroups?: (studentId: string, groups: string[]) => void;
  onEditStudentInfo?: (studentId: string, updates: any) => void;
}

export function AllStudentsView({ students, onDeleteStudent, history = [], groups = [], onUpdateStudentGroups, onEditStudentInfo }: AllStudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [studentToAssign, setStudentToAssign] = useState<any>(null);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

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
    const groupString = (student.groups ? student.groups.join(', ') : (student.group || '')).toLowerCase();
    return fullName.includes(query) || groupString.includes(query);
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
              className="cursor-pointer rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative group flex flex-col"
            >
              {/* Top part with avatar and actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="relative">
                  {/* Status Badge */}
                  <span className="absolute -top-2 -left-2 z-10 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-green-100 dark:border-green-500/20">
                    FAOL
                  </span>
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img 
                      src={getAvatarUrl(student.avatar, student.id || student.firstName)} 
                      alt="avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStudentToEdit(student);
                      setEditFirstName(student.firstName || '');
                      setEditLastName(student.lastName || '');
                      setEditPhone(student.phone || '');
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="O'quvchi ma'lumotlarini tahrirlash"
                  >
                    <Edit2 className="h-[18px] w-[18px]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStudentToAssign(student);
                      setSelectedGroups(student.groups || (student.group ? [student.group] : []));
                    }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Guruhga biriktirish"
                  >
                    <FolderPlus className="h-[18px] w-[18px]" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, student)}
                    className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="O'quvchini o'chirish"
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>

              {/* Name & ID */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                  ID: #{student.id ? student.id.substring(0, 7).toUpperCase() : 'ST-2940'}
                </p>
              </div>
              
              <hr className="border-slate-100 dark:border-slate-800 mb-4" />

              {/* Stats / Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-slate-500 dark:text-slate-400">Telefon:</span>
                  <span className="font-medium text-blue-700 dark:text-blue-400">{student.phone}</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-slate-500 dark:text-slate-400">Guruh:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.groups ? student.groups.join(', ') : student.group}</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-slate-500 dark:text-slate-400">Username:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.username}</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-slate-500 dark:text-slate-400">Parol:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.password || 'Kiritilmagan'}</span>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-auto">
                <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  Batafsil ma'lumot
                </button>
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

      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">O'quvchini tahrirlash</h3>
              <button
                onClick={() => setStudentToEdit(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ism
                </label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Familiya
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Telefon raqami
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStudentToEdit(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  if (onEditStudentInfo && studentToEdit.id) {
                    onEditStudentInfo(studentToEdit.id, {
                      firstName: editFirstName.trim(),
                      lastName: editLastName.trim(),
                      phone: editPhone.trim()
                    });
                  }
                  setStudentToEdit(null);
                }}
                disabled={!editFirstName.trim() || !editLastName.trim() || !editPhone.trim()}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Group Modal */}
      {studentToAssign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Guruhga biriktirish</h3>
              <button
                onClick={() => setStudentToAssign(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              <span className="font-semibold text-slate-900 dark:text-white">{studentToAssign.firstName} {studentToAssign.lastName}</span> ni quyidagi guruhlarga biriktirish:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2">
              {groups && groups.length > 0 ? (
                groups.map(group => (
                  <label key={group} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, group]);
                        } else {
                          setSelectedGroups(selectedGroups.filter(g => g !== group));
                        }
                      }}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{group}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Guruhlar mavjud emas.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStudentToAssign(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  if (onUpdateStudentGroups && studentToAssign.id) {
                    onUpdateStudentGroups(studentToAssign.id, selectedGroups);
                  }
                  setStudentToAssign(null);
                }}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
              >
                Saqlash
              </button>
            </div>
          </div>
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
                      <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 markdown-body">
                        <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>{sol.problemText}</Markdown>
                      </div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Yechim:</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 markdown-body">
                        <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>{sol.solutionSteps}</Markdown>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Javob: <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>{sol.finalAnswer}</Markdown>
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
  onDeleteGroup: (groupId: string) => void;
  students?: any[];
  history?: GradingResult[];
  tasks?: any[];
  onDeleteTask?: (task: any) => void;
  onEditGroup?: (groupId: string, data: any) => Promise<void>;
  onDeleteResult?: (taskId: string, studentUsername: string) => void;
}

export function AllGroupsView({ groups, onDeleteGroup, students = [], history = [], tasks = [], onDeleteTask, onEditGroup, onDeleteResult }: AllGroupsViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string, name: string } | null>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'tasks' | 'all-students'>('students');
  const [selectedTaskAnalysis, setSelectedTaskAnalysis] = useState<any>(null);
  const [analysisTab, setAnalysisTab] = useState<'tahlil' | 'submissions'>('tahlil');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [resultToDelete, setResultToDelete] = useState<{ taskId: string, studentUsername: string, studentName: string } | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string, groupName: string) => {
    e.stopPropagation();
    setGroupToDelete({ id, name: groupName });
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      onDeleteGroup(groupToDelete.id);
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

  const confirmResultDelete = async () => {
    if (resultToDelete && onDeleteResult) {
      await onDeleteResult(resultToDelete.taskId, resultToDelete.studentUsername);
      setResultToDelete(null);
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
    const groupStudents = students.filter(s => s.group === selectedGroup.name || (s.groups && s.groups.includes(selectedGroup.name)));
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
    }).sort((a, b) => {
      if (b.tasksCompleted !== a.tasksCompleted) {
        return b.tasksCompleted - a.tasksCompleted;
      }
      return b.averageScore - a.averageScore;
    });
  };

  const groupStudents = getGroupStudents();

  const handleDownloadExcel = () => {
    if (!selectedGroup || !groupStudents || groupStudents.length === 0) return;

    const excelData = groupStudents.map((student, index) => ({
      'O\'rin': index + 1,
      'Ism': student.firstName,
      'Familiya': student.lastName,
      'Bajarilgan vazifalar': student.tasksCompleted,
      'O\'rtacha ball': student.averageScore > 0 ? Number(student.averageScore.toFixed(1)) : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reyting');

    const wscols = [
      { wch: 6 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 20 }, 
      { wch: 15 } 
    ];
    worksheet['!cols'] = wscols;

    const fileName = `${selectedGroup.name.replace(/\s+/g, '_')}_reytingi.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
              className="cursor-pointer rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 relative group flex flex-col"
            >
              <div className="flex justify-between items-start mb-5">
                {/* Badge */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-sm">
                  <Users className="w-3.5 h-3.5" />
                  {group.name.split(' ')[0]}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                    }}
                    className="flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors"
                    title="Guruhni tahrirlash"
                  >
                    <Edit2 className="h-3.5 w-3.5 mb-0.5" />
                    <span className="text-[8px] sm:text-[9px] font-medium leading-none">Tahrirlash</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, group.id || index.toString(), group.name)}
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-slate-800 text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors"
                    title="Guruhni o'chirish"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#0a1629] dark:text-white mb-2 sm:mb-3 tracking-tight">
                {group.name}
              </h3>
              <div className="w-12 h-1 bg-blue-600 rounded-full mb-6"></div>

              <div className="space-y-4 sm:space-y-5 mt-auto">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="pt-0.5 sm:pt-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">Kunlari</p>
                    <p className="text-[#0a1629] dark:text-slate-200 font-medium text-sm sm:text-base leading-tight max-w-[180px]">{group.days}</p>
                  </div>
                </div>
                
                <hr className="border-slate-100 dark:border-slate-800/60" />

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="pt-0.5 sm:pt-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">Soati</p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">{group.time}</p>
                  </div>
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

      {/* Delete Result Confirmation Modal */}
      {resultToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Haqiqatdan ham o'chirishni xohlaysizmi?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Siz "{resultToDelete.studentName}" ning vazifa natijasini butunlay o'chirib yuboryapsiz. O'quvchi vazifani qayta ishlashi mumkin bo'ladi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResultToDelete(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmResultDelete}
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
            <div className="absolute right-6 top-6 sm:right-10 sm:top-10 flex items-center gap-2 z-10">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition-colors"
                title="Reytingni excel formatda yuklash"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Yuklash</span>
              </button>
              <button
                onClick={() => setSelectedGroup(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6 flex items-center gap-4 pr-10 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Guruh ma'lumotlari va reytingi</p>
              </div>
            </div>

            <div className="mb-8 shrink-0">
              <div className="space-y-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 max-w-sm">
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
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm shrink-0 ${
                              idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                              idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/50 dark:text-slate-300' :
                              idx === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400' :
                              'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                              {student.avatar ? (
                                <img src={getAvatarUrl(student.avatar)} alt="Avatar" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800" />
                              ) : (
                                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                              )}
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
                    const groupTasks = tasks.filter(t => t.group === selectedGroup?.name || !t.group || t.group === 'Barcha guruhlar' || t.group === '').sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    return groupTasks.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1 mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Jami vazifalar: {groupTasks.length} ta</span>
                          <span className="text-xs text-slate-500 dark:text-slate-500">Eng yangilari birinchi tartibda</span>
                        </div>
                        {groupTasks.map((task, idx) => (
                          <div 
                            key={task.id || idx}
                            onClick={() => {
                              setSelectedTaskAnalysis(task);
                              setAnalysisTab('tahlil');
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors cursor-pointer`}
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
                                {task.teacherAnalysis?.questionCount || 0} ta savol
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
                    const allStudents = students.filter(s => s.group === selectedGroup?.name || (s.groups && s.groups.includes(selectedGroup?.name)));
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
    
      {selectedTaskAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 pb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedTaskAnalysis.title}
                </h3>
                <button 
                  onClick={() => setSelectedTaskAnalysis(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex px-6 gap-6">
                <button
                  onClick={() => setAnalysisTab('tahlil')}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                    analysisTab === 'tahlil' 
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Tahlil
                </button>
                <button
                  onClick={() => setAnalysisTab('submissions')}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                    analysisTab === 'submissions' 
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Vazifa bajarganlar
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              {analysisTab === 'tahlil' && (
                selectedTaskAnalysis.teacherAnalysis ? (
                  <>
                    <div className="mb-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">
                        <span className="font-semibold">Jami savollar soni:</span> {selectedTaskAnalysis.teacherAnalysis?.questionCount || 0} ta
                      </p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                        Ushbu tahlil avtomatik tekshiruv uchun asos bo'lib xizmat qiladi. O'quvchilar javoblari ushbu yechimlar asosida baholanadi.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {selectedTaskAnalysis.teacherAnalysis?.solutions?.map((sol: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                          <div className="font-semibold text-slate-900 dark:text-white mb-2">
                            {sol.problemNumber}-savol
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 markdown-body">
                            <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>{sol.problemText}</Markdown>
                          </div>
                          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Yechim:</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 markdown-body">
                            <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>{sol.solutionSteps}</Markdown>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            Javob: <Markdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>{sol.finalAnswer}</Markdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">Ushbu vazifa uchun tahlil mavjud emas.</p>
                  </div>
                )
              )}

              {analysisTab === 'submissions' && (
                (() => {
                  const submissions = history
                    .filter(h => h.taskId === selectedTaskAnalysis.id)
                    .sort((a, b) => (b.score || 0) - (a.score || 0));

                  const uniqueSubmissions = submissions.reduce((acc: any[], curr: any) => {
                    if (!acc.find(item => item.studentUsername === curr.studentUsername)) {
                      acc.push(curr);
                    }
                    return acc;
                  }, []);
                  
                  const taskGroup = selectedTaskAnalysis.group;
                  const relevantStudents = (taskGroup && taskGroup !== 'Barcha guruhlar' && taskGroup !== '') 
                    ? students.filter(s => s.group === taskGroup || (s.groups && s.groups.includes(taskGroup))) 
                    : students;

                  const submittedStudents = uniqueSubmissions.map(sub => {
                    const student = relevantStudents.find(s => s.username === sub.studentUsername) || students.find(s => s.username === sub.studentUsername);
                    return {
                      ...sub,
                      studentInfo: student || { firstName: sub.studentUsername, lastName: '' },
                      isSubmitted: true
                    };
                  });
                  
                  const submittedUsernames = uniqueSubmissions.map(sub => sub.studentUsername);
                  const unsubmittedStudents = relevantStudents
                    .filter(s => !submittedUsernames.includes(s.username))
                    .map(s => ({
                      studentInfo: s,
                      score: 0,
                      isSubmitted: false
                    }));
                  
                  const allRanked = [...submittedStudents, ...unsubmittedStudents];

                  const handleDownloadTaskExcel = () => {
                    if (allRanked.length === 0) return;
                    
                    const excelData = allRanked.map((item, index) => ({
                      'O\'rin': item.isSubmitted ? index + 1 : '-',
                      'Ism': item.studentInfo.firstName || item.studentInfo.fullName,
                      'Familiya': item.studentInfo.lastName || '',
                      'Holati': item.isSubmitted ? 'Bajargan' : 'Bajarmagan',
                      'Ball': item.isSubmitted ? item.score : 0,
                      'Yuborilgan sana': item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : '-'
                    }));
                    
                    const worksheet = XLSX.utils.json_to_sheet(excelData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Natijalar');
                    
                    const wscols = [
                      { wch: 6 }, 
                      { wch: 15 }, 
                      { wch: 15 }, 
                      { wch: 15 }, 
                      { wch: 10 },
                      { wch: 15 }
                    ];
                    worksheet['!cols'] = wscols;
                    
                    const fileName = `${selectedTaskAnalysis.title.replace(/\s+/g, '_')}_natijalari.xlsx`;
                    XLSX.writeFile(workbook, fileName);
                  };

                  return (
                    <div className="space-y-4">
                      {allRanked.length > 0 && (
                        <div className="flex justify-end">
                          <button
                            onClick={handleDownloadTaskExcel}
                            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition-colors"
                            title="Natijalarni excel formatda yuklash"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Yuklash</span>
                          </button>
                        </div>
                      )}
                      {allRanked.length > 0 ? (
                        <div className="space-y-3">
                          {allRanked.map((item: any, idx: number) => {
                            const student = item.studentInfo;
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-4 rounded-xl border ${item.isSubmitted ? 'border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors' : 'border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10'} opacity-${item.isSubmitted ? '100' : '75'}`}
                                onClick={() => { if (item.isSubmitted) setSelectedSubmission(item); }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm shrink-0 ${
                                    !item.isSubmitted ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' :
                                    idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                    idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                                    idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                  }`}>
                                    {item.isSubmitted ? idx + 1 : '-'}
                                  </div>
                                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    {student.avatar ? (
                                      <img src={getAvatarUrl(student.avatar)} alt="Avatar" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800" />
                                    ) : (
                                      <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className={`font-semibold ${item.isSubmitted ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                      {student.firstName || student.fullName} {student.lastName}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {item.isSubmitted 
                                        ? `Natija yuborilgan: ${item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ''}`
                                        : "Vazifa bajarmagan"
                                      }
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                  {item.isSubmitted ? (
                                    <>
                                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                                        item.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                        item.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                      }`}>
                                        {item.score} ball
                                      </span>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const tId = item.taskId || selectedTaskAnalysis?.id;
                                          const sUser = item.studentUsername || item.studentInfo?.username;
                                          const sName = `${item.studentInfo?.firstName || item.studentInfo?.fullName || sUser} ${item.studentInfo?.lastName || ''}`.trim();
                                          if (tId && sUser) {
                                            setResultToDelete({ taskId: tId, studentUsername: sUser, studentName: sName });
                                          } else {
                                            alert("Xatolik: Vazifa yoki o'quvchi ma'lumoti topilmadi.");
                                          }
                                        }}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-800"
                                        title="Natijani bekor qilish"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                      0 ball
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-slate-500 dark:text-slate-400">Ushbu guruhda o'quvchilar mavjud emas yoki vazifani hech kim bajarmagan.</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTaskAnalysis(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between p-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedSubmission.studentInfo?.firstName || selectedSubmission.studentInfo?.fullName} {selectedSubmission.studentInfo?.lastName || ''}
                    </h3>
                    {selectedTaskAnalysis && (
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                        {selectedTaskAnalysis.title}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Natija yuborilgan: {selectedSubmission.createdAt?.seconds ? new Date(selectedSubmission.createdAt.seconds * 1000).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold ${
                    selectedSubmission.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    selectedSubmission.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>
                    {selectedSubmission.score} ball
                  </span>
                  <button 
                    onClick={() => setSelectedSubmission(null)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Sun'iy intellekt xulosasi va tahlili
                </h4>
                <div className="markdown-body text-sm font-mono p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
                  <Markdown
                    remarkPlugins={[remarkMath, remarkBreaks]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {selectedSubmission.feedback || "Tahlil muddati o'tgan (1 hafta) yoki mavjud emas."}
                  </Markdown>
                </div>
              </div>

              {selectedSubmission.errorSteps && selectedSubmission.errorSteps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    Izohlar va xatolar
                  </h4>
                  <ul className="space-y-2">
                    {selectedSubmission.errorSteps.map((error: string, idx: number) => {
                      const isWarning = error.startsWith("[WARNING] ");
                      const cleanStep = isWarning ? error.replace("[WARNING] ", "") : error;
                      
                      return (
                        <li key={idx} className={`flex gap-3 text-sm p-4 rounded-xl border ${
                          isWarning
                            ? "text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50"
                            : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50"
                        }`}>
                          {isWarning ? (
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                          )}
                          <div className="markdown-body leading-relaxed overflow-x-auto w-full">
                            <Markdown
                              remarkPlugins={[remarkMath, remarkBreaks]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {cleanStep}
                            </Markdown>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {editingGroup && onEditGroup && (
        <EditGroupModal
          isOpen={true}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
          onEditGroup={onEditGroup}
        />
      )}
</div>
  );
}
