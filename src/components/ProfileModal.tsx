import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, User, Settings, PieChart, Users, BookOpen, Edit2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GradingResult } from '../types';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  onUsernameChange?: (newUsername: string) => void;
}

export function ProfileModal({ isOpen, onClose, history, isDarkMode, toggleDarkMode, username, onLogout, userRole, studentInfo, tasks = [], onUsernameChange }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(studentInfo?.firstName || '');
  const [lastName, setLastName] = useState(studentInfo?.lastName || '');
  const [newUsername, setNewUsername] = useState(username || '');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when opened or studentInfo changes
  useEffect(() => {
    if (isOpen) {
      setFirstName(studentInfo?.firstName || '');
      setLastName(studentInfo?.lastName || '');
      setNewUsername(username || '');
      setIsEditing(false);
      setUsernameStatus('idle');
    }
  }, [isOpen, studentInfo, username]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!newUsername || newUsername.trim() === username) {
        setUsernameStatus('idle');
        return;
      }
      
      setIsCheckingUsername(true);
      try {
        const q = query(collection(db, "students"), where("username", "==", newUsername.trim()));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [newUsername, username]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (usernameStatus === 'taken') return;
    
    setIsSaving(true);
    try {
      if (studentInfo?.id) {
        await updateDoc(doc(db, "students", studentInfo.id), {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: newUsername.trim()
        });
        
        if (newUsername.trim() !== username && onUsernameChange) {
          onUsernameChange(newUsername.trim());
        }
        
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

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

          {userRole === 'student' && (
            <div className="flex justify-center -mt-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                {isEditing ? "Tahrirlashni bekor qilish" : "Ma'lumotlarni tahrirlash"}
              </button>
            </div>
          )}

          {isEditing && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ism</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Familiya</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                    className={`w-full pl-3 pr-10 py-2 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      usernameStatus === 'taken' ? 'border-rose-300 focus:ring-rose-500' : 
                      usernameStatus === 'available' ? 'border-emerald-300 focus:ring-emerald-500' : 
                      'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    {isCheckingUsername ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    ) : usernameStatus === 'available' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : usernameStatus === 'taken' ? (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    ) : null}
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">Bu username band. Boshqa tanlang.</p>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || usernameStatus === 'taken' || !firstName.trim() || !lastName.trim() || !newUsername.trim()}
                className="w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</>
                ) : (
                  "Saqlash"
                )}
              </button>
            </div>
          )}

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
                  <p className="font-bold text-slate-900 dark:text-white">
                    {studentInfo.groups && studentInfo.groups.length > 0 
                      ? studentInfo.groups.join(', ') 
                      : (studentInfo.group || 'Guruhsiz')}
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Vazifalar</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {tasks.filter(t => !t.group || t.group === 'Barcha guruhlar' || t.group === studentInfo.group || (studentInfo.groups && studentInfo.groups.includes(t.group))).length} ta mavjud
                  </p>
                </div>
              </div>
            </section>
          )}

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
