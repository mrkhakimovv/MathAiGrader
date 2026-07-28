import React from 'react';
import { Home, Users, UserPlus, FilePlus, Library, User, CheckSquare, BookOpen, BarChart2 } from 'lucide-react';

export type ViewType = 'home' | 'all-students' | 'create-group' | 'create-task' | 'all-groups' | 'grade-task' | 'student-tasks' | 'student-stats';

interface SidebarProps {
  onProfileClick: () => void;
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
  role: 'admin' | 'teacher' | 'student' | null;
}

export function Sidebar({ onProfileClick, activeView, onChangeView, role }: SidebarProps) {
  return (
    <div className="w-16 md:w-20 bg-indigo-600 dark:bg-indigo-500 flex flex-col items-center py-8 gap-8 rounded-r-3xl h-screen sticky top-0 shrink-0 shadow-lg z-10">
      <button 
        onClick={() => onChangeView('home')}
        className={`${activeView === 'home' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
        title="Home"
      >
        <Home className="h-6 w-6 md:h-7 md:w-7" />
      </button>

      {role === 'teacher' && (
        <>
          <button 
            onClick={() => onChangeView('all-students')}
            className={`${activeView === 'all-students' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
            title="Barcha o'quvchilar (All Students)"
          >
            <Users className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          
          <button 
            onClick={() => onChangeView('create-task')}
            className={`${activeView === 'create-task' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
            title="Vazifa yaratish (Create Task)"
          >
            <FilePlus className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          
          <button 
            onClick={() => onChangeView('all-groups')}
            className={`${activeView === 'all-groups' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
            title="Barcha guruhlar (All Groups)"
          >
            <Library className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          
          <button 
            onClick={() => onChangeView('grade-task')}
            className={`${activeView === 'grade-task' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
            title="Tekshirish (Grade Task)"
          >
            <CheckSquare className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </>
      )}

      {role === 'student' && (
        <>
          <button 
            onClick={() => onChangeView('student-tasks')}
            className={`${activeView === 'student-tasks' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
            title="Uyga vazifalar (Tasks)"
          >
            <BookOpen className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          
          <button 
            onClick={() => onChangeView('student-stats')}
            className={`${activeView === 'student-stats' ? 'text-white scale-110' : 'text-indigo-200'} hover:text-white hover:scale-110 transition-all`} 
            title="Statistika (Statistics)"
          >
            <BarChart2 className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </>
      )}

      <div className="flex-1" />
      <button 
        onClick={onProfileClick}
        className="text-indigo-200 hover:text-white hover:scale-110 transition-all" 
        title="Profile"
      >
        <User className="h-6 w-6 md:h-7 md:w-7" />
      </button>
    </div>
  );
}
