import React, { useState } from 'react';
import { Shield, Moon, Sun, UserPlus, Trash2, Key, Users, LogOut } from 'lucide-react';

interface AdminPanelProps {
  teachers: any[];
  onCreateTeacher: (u: string, p: string) => void;
  onDeleteTeacher: (u: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

export function AdminPanel({ teachers, onCreateTeacher, onDeleteTeacher, isDarkMode, toggleDarkMode, onLogout }: AdminPanelProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newPassword.trim()) {
      onCreateTeacher(newUsername.trim(), newPassword.trim());
      setNewUsername('');
      setNewPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-900 dark:text-slate-100 md:p-8 transition-colors">
      <div className="mx-auto max-w-4xl relative">
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onLogout}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <header className="mb-10 text-left pt-12 md:pt-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system settings and teacher accounts.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Teacher Form */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm self-start">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Create Teacher
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="teacher_name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all mt-6"
              >
                Create Account
              </button>
            </form>
          </div>

          {/* Teacher List */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Active Teachers
            </h2>
            {teachers.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400">No teacher accounts created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher, idx) => (
                  <div key={teacher.id || idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{teacher.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {teacher.username}
                          <span 
                            className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(teacher.id);
                              alert(`ID ${teacher.id} nusxalandi!`);
                            }}
                            title="ID ni nusxalash"
                          >
                            ID: {teacher.id}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Key className="h-3 w-3" /> Password set
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteTeacher(teacher.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                      title="Delete account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
