import React from 'react';
import { 
  Home, 
  Users, 
  UserPlus, 
  FilePlus, 
  Library, 
  User, 
  CheckSquare, 
  BookOpen, 
  BarChart2, 
  Trophy, 
  Megaphone, 
  Coins, 
  Wallet, 
  CalendarCheck 
} from 'lucide-react';
import { getAvatarUrl } from '../lib/utils';

export type ViewType = 
  | 'home' 
  | 'all-students' 
  | 'create-group' 
  | 'create-task' 
  | 'all-groups' 
  | 'grade-task' 
  | 'student-tasks' 
  | 'student-stats' 
  | 'student-rating' 
  | 'teacher-rating' 
  | 'teacher-payments' 
  | 'teacher-attendance' 
  | 'admin-create-teacher' 
  | 'admin-ads' 
  | 'admin-students' 
  | 'admin-expenses';

interface SidebarProps {
  onProfileClick: () => void;
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
  role: 'admin' | 'teacher' | 'student' | null;
  uncompletedTasksCount?: number;
  userAvatar?: string;
}

export function Sidebar({ 
  onProfileClick, 
  activeView, 
  onChangeView, 
  role, 
  uncompletedTasksCount = 0, 
  userAvatar 
}: SidebarProps) {
  // Navigation elements for each role
  const navItems: { id: ViewType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [];

  if (role === 'admin') {
    navItems.push(
      { id: 'admin-create-teacher', label: "O'qituvchi qo'shish", icon: UserPlus },
      { id: 'admin-ads', label: "Reklamalar", icon: Megaphone },
      { id: 'admin-students', label: "Barcha o'quvchilar", icon: Users },
      { id: 'admin-expenses', label: "Xarajatlar", icon: Coins }
    );
  } else if (role === 'student') {
    navItems.push(
      { id: 'home', label: "Bosh sahifa", icon: Home },
      { id: 'student-rating', label: "Reyting", icon: Trophy },
      { id: 'student-tasks', label: "Uyga vazifalar", icon: BookOpen, badge: uncompletedTasksCount },
      { id: 'student-stats', label: "Statistika", icon: BarChart2 }
    );
  } else {
    // Teacher
    navItems.push(
      { id: 'home', label: "Bosh sahifa", icon: Home },
      { id: 'all-students', label: "O'quvchilar", icon: Users },
      { id: 'create-task', label: "Vazifa yaratish", icon: FilePlus },
      { id: 'all-groups', label: "Guruhlar", icon: Library },
      { id: 'grade-task', label: "Tekshirish", icon: CheckSquare },
      { id: 'teacher-rating', label: "Reyting", icon: Trophy },
      { id: 'teacher-payments', label: "To'lovlar", icon: Wallet },
      { id: 'teacher-attendance', label: "Davomat", icon: CalendarCheck }
    );
  }

  return (
    <aside className="fixed md:sticky bottom-0 md:top-0 left-0 right-0 md:w-64 bg-indigo-600 dark:bg-indigo-600 flex md:flex-col justify-between md:justify-start rounded-t-2xl md:rounded-t-none md:rounded-r-3xl h-16 md:h-screen shadow-[0_-4px_20px_rgba(0,0,0,0.15)] md:shadow-xl z-50 shrink-0 transition-all select-none">
      {/* Desktop Brand Header */}
      <div className="hidden md:flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center p-1.5 shadow-sm border border-white/20 shrink-0">
          <img src="/logo.png" alt="ALMATH" className="w-full h-full object-cover rounded-xl" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-white font-black text-lg tracking-tight leading-tight">ALMATH</span>
          <span className="text-indigo-200 text-xs font-medium truncate">
            {role === 'teacher' ? "O'qituvchi paneli" : role === 'admin' ? "Admin paneli" : "O'quvchi paneli"}
          </span>
        </div>
      </div>

      {/* Desktop Navigation Items with full section names */}
      <nav className="hidden md:flex flex-col gap-1.5 px-3 py-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer group text-left ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-md font-bold'
                  : 'text-indigo-100 hover:text-white hover:bg-white/10 font-medium'
              }`}
              title={item.label}
            >
              <Icon 
                className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-indigo-600' : 'text-indigo-200 group-hover:text-white'
                }`} 
              />
              <span className="truncate flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Profile at Bottom */}
      <div className="hidden md:block p-3 border-t border-indigo-500/40">
        <button
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-100 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left group"
          title="Mening profilim"
        >
          {userAvatar ? (
            <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white/60 shrink-0 shadow-xs">
              <img src={getAvatarUrl(userAvatar)} alt="Profile" className="w-full h-full object-cover bg-indigo-50" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 transition-colors">
              <User className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col text-left truncate flex-1">
            <span className="text-white text-sm font-bold truncate">Profil</span>
            <span className="text-indigo-200 text-xs truncate">Sozlamalar va hisob</span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center justify-around w-full h-full px-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all min-w-[44px] cursor-pointer ${
                isActive ? 'text-white font-bold' : 'text-indigo-200 hover:text-white'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] leading-tight mt-0.5 truncate max-w-[48px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-lg text-indigo-200 hover:text-white transition-all min-w-[44px] cursor-pointer"
          title="Profil"
        >
          {userAvatar ? (
            <div className="h-5 w-5 rounded-full overflow-hidden border border-white">
              <img src={getAvatarUrl(userAvatar)} alt="Profile" className="w-full h-full object-cover bg-indigo-50" />
            </div>
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="text-[9px] leading-tight mt-0.5">Profil</span>
        </button>
      </div>
    </aside>
  );
}
