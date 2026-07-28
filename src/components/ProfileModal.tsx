import React from 'react';
import { X, Moon, Sun, User, Settings, PieChart, Users, BookOpen } from 'lucide-react';
import { GradingResult } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GradingResult[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  username: string;
  onLogout: () => void;
  userRole?: 'admin' | 'teacher' | 'student' | null;
  studentInfo?: any;
  tasks?: any[];
}

export function ProfileModal({ isOpen, onClose, history, isDarkMode, toggleDarkMode, username, onLogout, userRole, studentInfo, tasks = [] }: ProfileModalProps) {
  if (!isOpen) return null;

  const total = history.length;
  const avgScore = total > 0 ? (history.reduce((acc, curr) => acc + curr.score, 0) / total).toFixed(1) : "0.0";
  const perfect = history.filter(h => h.isCorrect).length;
  const incorrect = history.filter(h => !h.isCorrect && !h.isPartiallyCorrect).length;
  const partial = total - perfect - incorrect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Profile & Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800 shrink-0">
              <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{studentInfo?.firstName ? `${studentInfo.firstName} ${studentInfo.lastName}` : username}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {userRole === 'admin' ? 'Administrator' : 
                 userRole === 'teacher' ? 'O\'qituvchi' : 
                 userRole === 'student' ? 'O\'quvchi' : 'Foydalanuvchi'}
              </p>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Student Specific Info */}
          {userRole === 'student' && studentInfo && (
            <section className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Guruh</p>
                  <p className="font-bold text-slate-900 dark:text-white">{studentInfo.group || 'Guruhsiz'}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Vazifalar</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {tasks.filter(t => !t.group || t.group === studentInfo.group).length} ta mavjud
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Stats */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4" />
              Your Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Problems Graded</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{total}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Average Score</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{avgScore} / 100</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-between">
               <div className="flex-1 text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-2 rounded-lg">
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold">{perfect}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Perfect</div>
               </div>
               <div className="flex-1 text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-2 rounded-lg">
                  <div className="text-amber-700 dark:text-amber-400 font-bold">{partial}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-500 uppercase tracking-wider">Partial</div>
               </div>
               <div className="flex-1 text-center bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 p-2 rounded-lg">
                  <div className="text-rose-700 dark:text-rose-400 font-bold">{incorrect}</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-500 uppercase tracking-wider">Incorrect</div>
               </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Settings */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" />
              Settings
            </h4>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Toggle application appearance</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="mt-4 w-full flex justify-center items-center py-2.5 px-4 border border-rose-200 dark:border-rose-800/50 rounded-xl shadow-sm text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 focus:outline-none transition-colors"
            >
              Sign Out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
