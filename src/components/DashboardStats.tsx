import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, CheckCircle, GraduationCap, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface Props {
  groupDetails: any[];
  students: any[];
  tasks: any[];
}

export function DashboardStats({ groupDetails, students, tasks }: Props) {
  const totalGroups = groupDetails.length;
  const totalStudents = students.length;
  const totalTasks = tasks.length;
  
  // Calculate average score if possible, etc.

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bosh sahifa</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Umumiy ko'rsatkichlar va statistikalar.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4"
        >
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Umumiy guruhlar</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalGroups}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4"
        >
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">O'quvchilar soni</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4"
        >
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vazifalar</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalTasks}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Guruhlar bo'yicha o'quvchilar
          </h3>
          <div className="space-y-4">
            {groupDetails.length > 0 ? groupDetails.map((group, index) => {
              const studentsInGroup = students.filter(s => s.group === group.name || (s.groups && s.groups.includes(group.name))).length;
              const maxStudents = Math.max(...groupDetails.map(g => students.filter(s => s.group === g.name || (s.groups && s.groups.includes(g.name))).length), 1);
              const percentage = (studentsInGroup / maxStudents) * 100;
              
              return (
                <div key={group.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{group.name}</span>
                    <span className="text-slate-500">{studentsInGroup} o'quvchi</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500 text-center py-4">Guruhlar mavjud emas</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Faol o'quvchilar
          </h3>
          <div className="space-y-4">
            {students.length > 0 ? students.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-slate-500">{student.groups ? student.groups.join(', ') : student.group}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Award className="w-4 h-4" />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">O'quvchilar mavjud emas</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
