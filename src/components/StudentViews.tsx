import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Calendar, Clock, BarChart2 } from 'lucide-react';
import { GradingResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StudentTasksViewProps {
  tasks: any[];
  studentInfo?: any;
  onSolveTask?: (task: any) => void;
}

export function StudentTasksView({ tasks, studentInfo, onSolveTask }: StudentTasksViewProps) {
  const [now, setNow] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>('Barcha vazifalar');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (endDateStr: string) => {
    if (!endDateStr) return "Muddat belgilanmagan";
    const endDate = new Date(endDateStr);
    const diffMs = endDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Muddat o'tgan";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays} kun, ${diffHours} soat qoldi`;
    if (diffHours > 0) return `${diffHours} soat, ${diffMinutes} daqiqa qoldi`;
    return `${diffMinutes} daqiqa qoldi`;
  };

  const isExpired = (endDateStr: string) => {
    return false;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString('uz-UZ', { 
      day: 'numeric', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  const studentGroups = studentInfo?.groups || (studentInfo?.group ? [studentInfo.group] : []);
  
  const studentTasks = tasks.filter(t => !t.group || t.group === 'Barcha guruhlar' || t.group === studentInfo?.group || (studentInfo?.groups && studentInfo.groups.includes(t.group)));

  const filteredTasks = selectedGroup === 'Barcha vazifalar' 
    ? studentTasks 
    : studentTasks.filter(t => t.group === selectedGroup || !t.group || t.group === 'Barcha guruhlar');

  // Sort tasks: pending first, then expired
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aExpired = isExpired(a.endDate);
    const bExpired = isExpired(b.endDate);
    if (aExpired === bExpired) {
      // both expired or both pending. Sort by end date if available
      if (a.endDate && b.endDate) {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      return 0;
    }
    return aExpired ? 1 : -1;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Uyga vazifalar ro'yxati</h2>
      </div>
      
      {studentGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedGroup('Barcha vazifalar')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedGroup === 'Barcha vazifalar'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Barcha vazifalar
          </button>
          {studentGroups.map((group: string) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedGroup === group
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      )}
      
      {sortedTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Hozircha vazifalar yo'q</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">O'qituvchi tomonidan vazifalar qo'shilganda shu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => {
            const expired = isExpired(task.endDate);
            return (
              <div key={task.id} className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md ${expired ? 'opacity-75' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.group ? `${task.group} guruhi uchun` : 'Barcha guruhlar uchun'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {task.endDate && (
                      <>
                        <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg ${expired ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10'}`}>
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeLeft(task.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Muddat: {formatDate(task.endDate)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                   <button 
                     disabled={expired}
                     onClick={() => !expired && onSolveTask && onSolveTask(task)}
                     className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                       expired 
                         ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                         : 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600'
                     }`}
                   >
                     {expired ? "Vazifa muddati o'tgan" : "Vazifani ishlash va yuklash"}
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StudentStatsViewProps {
  tasks: any[];
  history: GradingResult[];
  studentInfo?: any;
}

export function StudentStatsView({ tasks, history, studentInfo }: StudentStatsViewProps) {
  const uniqueHistoryMap = new Map();
  history.forEach(h => {
    const key = h.taskId || h.createdAt || Math.random().toString();
    if (!uniqueHistoryMap.has(key) || uniqueHistoryMap.get(key).score < h.score) {
      uniqueHistoryMap.set(key, h);
    }
  });
  
  const uniqueHistory = Array.from(uniqueHistoryMap.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const completedTasks = uniqueHistory.length;
  // This is a naive calculation for demonstration. In a real app, we'd relate history to specific tasks.
  const averageScore = uniqueHistory.length > 0 
    ? (uniqueHistory.reduce((sum, r) => sum + r.score, 0) / uniqueHistory.length).toFixed(1) 
    : '0';

  const studentTasks = tasks.filter(t => !t.group || t.group === 'Barcha guruhlar' || t.group === studentInfo?.group || (studentInfo?.groups && studentInfo.groups.includes(t.group)));

  const chartData = useMemo(() => {
    // Reverse history to show oldest to newest left to right
    return [...uniqueHistory].reverse().map((item, index) => {
      const dateStr = item.createdAt?.toDate 
        ? item.createdAt.toDate().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
        : `Vazifa ${index + 1}`;
      return {
        name: dateStr,
        score: item.score
      };
    });
  }, [uniqueHistory]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <BarChart2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">To'liq Statistika</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">O'rtacha ball</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{averageScore} / 100</div>
          {history.length > 0 && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>A'lo natija!</span>
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Bajarilgan vazifalar</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{completedTasks} / {Math.max(studentTasks.length, completedTasks)}</div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Joriy chorak bo'yicha
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Guruhdagi o'rni</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">1 - o'rin</div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            A'lochi o'quvchilar qatorida
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">O'zlashtirish grafigi</h3>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Hozircha grafik ko'rsatish uchun ma'lumot yo'q</p>
          </div>
        )}
      </div>
      
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">So'nggi baholangan vazifalar</h3>
        {uniqueHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Hech qanday baholangan vazifa yo'q.</p>
        ) : (
          <div className="space-y-4">
            {uniqueHistory.slice(0, 5).map((result, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Vazifa yechimi</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {result.createdAt?.toDate ? result.createdAt.toDate().toLocaleDateString('uz-UZ') : "Yaqinda"}
                  </p>
                </div>
                <div className={`px-4 py-1.5 text-center rounded-full text-sm font-bold w-fit ${
                  result.score >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  result.score >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                  {result.score} ball
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
