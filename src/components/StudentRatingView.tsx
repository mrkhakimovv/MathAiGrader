import React, { useMemo } from 'react';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { GradingResult } from '../types';
import { getAvatarUrl } from '../lib/utils';

interface StudentRatingViewProps {
  students: any[];
  history: GradingResult[];
  studentInfo: any;
}

export function StudentRatingView({ students, history, studentInfo }: StudentRatingViewProps) {
  const currentStudentGroups = useMemo(() => {
    return studentInfo?.groups || (studentInfo?.group ? [studentInfo.group] : []);
  }, [studentInfo]);

  const leaderboard = useMemo(() => {
    if (currentStudentGroups.length === 0) return [];

    // Filter students who share at least one group with the current student
    const relevantStudents = students.filter(s => {
      const groups = s.groups || (s.group ? [s.group] : []);
      return groups.some((g: string) => currentStudentGroups.includes(g));
    });

    const studentScores = relevantStudents.map(student => {
      const studentHistory = history.filter(h => h.studentUsername === student.username);
      
      const uniqueHistoryMap = new Map();
      studentHistory.forEach(h => {
        const key = h.taskId || h.createdAt || Math.random().toString();
        if (!uniqueHistoryMap.has(key) || uniqueHistoryMap.get(key).score < h.score) {
          uniqueHistoryMap.set(key, h);
        }
      });
      const uniqueHistory = Array.from(uniqueHistoryMap.values());
      
      const totalTasks = uniqueHistory.length;
      const totalScore = uniqueHistory.reduce((sum, h) => sum + h.score, 0);
      const averageScore = totalTasks > 0 ? (totalScore / totalTasks).toFixed(1) : "0.0";
      
      return {
        ...student,
        totalTasks,
        totalScore,
        averageScore: parseFloat(averageScore)
      };
    });

    // Sort by total tasks (descending), then by average score (descending)
    return studentScores.sort((a, b) => {
      if (b.totalTasks !== a.totalTasks) {
        return b.totalTasks - a.totalTasks;
      }
      return b.averageScore - a.averageScore;
    });
  }, [students, history, currentStudentGroups]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guruhlar reytingi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Siz bilan bir guruhda o'qiydigan o'quvchilar natijalari</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Umumiy reyting
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Guruhdoshlar topilmadi
            </div>
          ) : (
            leaderboard.map((student, index) => {
              const isCurrentUser = student.username === studentInfo?.username;
              return (
                <div 
                  key={student.id || student.username} 
                  className={`p-4 flex items-center gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isCurrentUser ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  <div className="w-8 flex-shrink-0 text-center">
                    {index === 0 ? (
                      <Medal className="h-7 w-7 text-yellow-500 mx-auto" />
                    ) : index === 1 ? (
                      <Medal className="h-7 w-7 text-slate-400 mx-auto" />
                    ) : index === 2 ? (
                      <Medal className="h-7 w-7 text-amber-600 mx-auto" />
                    ) : (
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {student.avatar ? (
                      <img src={getAvatarUrl(student.avatar)} alt="Avatar" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800" />
                    ) : (
                      <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold truncate ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.username}
                      {isCurrentUser && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">Siz</span>}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {student.groups ? student.groups.join(', ') : (student.group || 'Guruhsiz')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Bajarilgan</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{student.totalTasks} ta</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">O'rtacha ball</p>
                      <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{student.averageScore}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
