import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { GradingResult } from '../types';

interface SummarySectionProps {
  history: GradingResult[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Count: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function SummarySection({ history }: SummarySectionProps) {
  if (history.length <= 1) return null;

  const total = history.length;
  const avgScore = (history.reduce((acc, curr) => acc + curr.score, 0) / total).toFixed(1);
  const perfect = history.filter(h => h.isCorrect).length;
  const incorrect = history.filter(h => !h.isCorrect && !h.isPartiallyCorrect).length;
  const partial = total - perfect - incorrect;

  const data = [
    { name: 'Perfect', count: perfect, color: '#10b981' },
    { name: 'Partial', count: partial, color: '#f59e0b' },
    { name: 'Incorrect', count: incorrect, color: '#f43f5e' },
  ];

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Overall Performance Summary</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{total}</div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Problems Graded</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{avgScore}<span className="text-lg text-slate-400 dark:text-slate-500">/10</span></div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Average Score</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex justify-center items-center gap-4">
           <div className="text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-500">{perfect}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Perfect</div>
           </div>
           <div className="text-center">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-500">{partial}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Partial</div>
           </div>
           <div className="text-center">
              <div className="text-xl font-bold text-rose-600 dark:text-rose-500">{incorrect}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Incorrect</div>
           </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">Grade Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#94a3b8', opacity: 0.1 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
