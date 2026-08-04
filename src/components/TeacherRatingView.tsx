import React, { useMemo } from 'react';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { GradingResult } from '../types';
import { getAvatarUrl } from '../lib/utils';

interface TeacherRatingViewProps {
  students: any[];
  history: GradingResult[];
  groups: string[];
}

export function TeacherRatingView({ students, history, groups }: TeacherRatingViewProps) {
  const [activeGroup, setActiveGroup] = React.useState<string>('Barchasi');

  const studentScores = useMemo(() => {
    return students.map(student => {
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
  }, [students, history]);

  const groupLeaderboards = useMemo(() => {
    const boards: Record<string, any[]> = {};
    
    // Initialize empty boards for all groups
    groups.forEach(g => {
      boards[g] = [];
    });
    
    // Assign students to their groups
    studentScores.forEach(student => {
      const studentGroups = student.groups || (student.group ? [student.group] : []);
      studentGroups.forEach((g: string) => {
        if (boards[g]) {
          boards[g].push(student);
        } else {
          // In case the student is in a group that is not in the groups array
          if (!boards['Boshqa']) boards['Boshqa'] = [];
          boards['Boshqa'].push(student);
        }
      });
    });
    
    // Sort each group's leaderboard
    Object.keys(boards).forEach(g => {
      boards[g].sort((a, b) => {
        if (b.totalTasks !== a.totalTasks) {
          return b.totalTasks - a.totalTasks;
        }
        return b.averageScore - a.averageScore;
      });
    });
    
    return boards;
  }, [studentScores, groups]);

  const allStudentsLeaderboard = useMemo(() => {
    return [...studentScores].sort((a, b) => {
      if (b.totalTasks !== a.totalTasks) {
        return b.totalTasks - a.totalTasks;
      }
      return b.averageScore - a.averageScore;
    });
  }, [studentScores]);

  const displayedGroups: [string, any[]][] = activeGroup === 'Barchasi' 
    ? [['Umumiy', allStudentsLeaderboard]]
    : Object.entries(groupLeaderboards).filter(([name]) => name === activeGroup);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guruhlar reytingi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Barcha guruhlarning alohida reytinglari</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGroup('Barchasi')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeGroup === 'Barchasi'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Barcha guruhlar
        </button>
        {Object.keys(groupLeaderboards).map(groupName => (
          <button
            key={groupName}
            onClick={() => setActiveGroup(groupName)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeGroup === groupName
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {groupName}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {displayedGroups.map(([groupName, leaderboard]) => (
          <div key={groupName} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                {groupName === 'Umumiy' ? 'Umumiy reyting' : `${groupName} guruhi reytingi`}
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-200/50 dark:bg-slate-800 px-3 py-1 rounded-full">
                {leaderboard.length} ta o'quvchi
              </span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Ushbu guruhda o'quvchilar yo'q
                </div>
              ) : (
                leaderboard.map((student, index) => {
                  return (
                    <div 
                      key={student.id || student.username} 
                      className="p-4 flex items-center gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
                        <h4 className="font-semibold truncate text-slate-900 dark:text-white">
                          {student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.username}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          @{student.username}
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
        ))}
      </div>
    </div>
  );
}
