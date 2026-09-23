import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, User, Settings, PieChart, Users, BookOpen, Edit2, CheckCircle, XCircle, Loader2, LogOut, RotateCw, Sparkles } from 'lucide-react';
import { GradingResult } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getAvatarUrl, AVATAR_SEEDS } from '../../lib/utils';
import { AccountSwitcher } from '../AccountSwitcher';
import { StoredAccount, patchAccount, encodeSecret } from '../../lib/accounts';
import { checkForAppUpdates, applyUpdateAndReload } from '../../lib/appUpdater';

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
  onProfileUpdate?: () => void;
  accounts?: StoredAccount[];
  activeAccountId?: string | null;
  switchingId?: string | null;
  onSwitchAccount?: (id: string) => void;
  onAddAccount?: () => void;
  onRemoveAccount?: (id: string) => void;
}

export function ProfileModal({ isOpen, onClose, history, isDarkMode, toggleDarkMode, username, onLogout, userRole, studentInfo, tasks = [], onUsernameChange, onProfileUpdate, accounts = [], activeAccountId, switchingId, onSwitchAccount, onAddAccount, onRemoveAccount }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(studentInfo?.firstName || '');
  const [lastName, setLastName] = useState(studentInfo?.lastName || '');
  const [newUsername, setNewUsername] = useState(username || '');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(studentInfo?.avatar || '');
  const [newPassword, setNewPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState<{
    type: 'idle' | 'checking' | 'updating' | 'latest' | 'error';
    message?: string;
  }>({ type: 'idle' });

  // Reset form when opened or studentInfo changes
  useEffect(() => {
    if (isOpen) {
      setFirstName(studentInfo?.firstName || '');
      setLastName(studentInfo?.lastName || '');
      setNewUsername(username || '');
      setSelectedAvatar(studentInfo?.avatar || '');
      setNewPassword('');
      setIsEditing(false);
      setUsernameStatus('idle');
      setUpdateStatus({ type: 'idle' });
    }
  }, [isOpen, studentInfo, username]);

  const handleCheckAndUpdate = async () => {
    setUpdateStatus({ type: 'checking', message: "Yangilanishlar tekshirilmoqda..." });
    try {
      const result = await checkForAppUpdates();
      if (result.hasUpdate) {
        setUpdateStatus({
          type: 'updating',
          message: "Yangi yangilanish topildi! Dastur to'liq qaytadan yuklanmoqda...",
        });
        setTimeout(async () => {
          await applyUpdateAndReload();
        }, 1200);
      } else {
        setUpdateStatus({
          type: 'latest',
          message: "Dastur allaqachon eng so'nggi versiyada!",
        });
      }
    } catch (err) {
      console.error("Yangilanishni tekshirishda xatolik:", err);
      setUpdateStatus({
        type: 'error',
        message: "Yangilanishni tekshirishda xatolik yuz berdi",
      });
    }
  };

  const handleForceReload = async () => {
    setUpdateStatus({
      type: 'updating',
      message: "Kesh tozalanib, dastur to'liq qayta yuklanmoqda...",
    });
    setTimeout(async () => {
      await applyUpdateAndReload();
    }, 700);
  };

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
        const updateData: any = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: newUsername.trim(),
          avatar: selectedAvatar
        };

        if (newPassword.trim()) {
          updateData.password = newPassword.trim();
        }

        await updateDoc(doc(db, "students", studentInfo.id), updateData);
        
        if (activeAccountId) {
          const patch: Partial<StoredAccount> = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: newUsername.trim(),
            avatar: selectedAvatar
          };
          
          if (newPassword.trim()) {
            patch.secret = encodeSecret(newPassword.trim());
          }
          
          patchAccount(activeAccountId, patch);
          if (onProfileUpdate) onProfileUpdate();
        }

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
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800 shrink-0 overflow-hidden">
              {studentInfo?.avatar ? (
                <img src={getAvatarUrl(studentInfo.avatar)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{studentInfo?.firstName ? `${studentInfo.firstName} ${studentInfo.lastName}` : username}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {userRole === 'admin' ? 'Administrator' : 
                 userRole === 'teacher' ? 'O\'qituvchi' : 
                 userRole === 'student' ? 'O\'quvchi' : 'Foydalanuvchi'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/50 shadow-sm text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-colors"
              title="Tizimdan chiqish"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Harakatlar paneli: Tahrirlash va Dasturni yangilash */}
          <div className="flex flex-col gap-2.5 -mt-2">
            <div className="flex items-center justify-center gap-2 flex-wrap w-full">
              {userRole === 'student' && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>{isEditing ? "Tahrirlashni bekor qilish" : "Ma'lumotlarni tahrirlash"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCheckAndUpdate}
                disabled={updateStatus.type === 'checking' || updateStatus.type === 'updating'}
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
                title="Dasturga yangilanish kelgan bo'lsa to'liq qayta yuklab yangilanishlarni qabul qilish"
              >
                <RotateCw
                  className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 ${
                    updateStatus.type === 'checking' || updateStatus.type === 'updating' ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {updateStatus.type === 'checking'
                    ? "Tekshirilmoqda..."
                    : updateStatus.type === 'updating'
                    ? "Yuklanmoqda..."
                    : "Dasturni yangilash"}
                </span>
              </button>
            </div>

            {/* Yangilanish holati xabarnomasi */}
            {updateStatus.type !== 'idle' && (
              <div
                className={`w-full p-3 rounded-xl border text-xs flex flex-col gap-1.5 animate-in fade-in duration-200 ${
                  updateStatus.type === 'updating'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : updateStatus.type === 'latest'
                    ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    : updateStatus.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {updateStatus.type === 'checking' && (
                      <RotateCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                    {updateStatus.type === 'updating' && (
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                    )}
                    {updateStatus.type === 'latest' && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {updateStatus.type === 'error' && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-semibold">{updateStatus.message}</span>
                  </div>
                  {updateStatus.type === 'latest' && (
                    <button
                      type="button"
                      onClick={() => setUpdateStatus({ type: 'idle' })}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {updateStatus.type === 'latest' && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 mt-0.5 flex-wrap gap-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Yangilanish ko'rinmayotgan bo'lsa:
                    </span>
                    <button
                      type="button"
                      onClick={handleForceReload}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Keshni tozalab qayta yuklash</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Yangi parol (ixtiyoriy)</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Bo'sh qoldirilsa, o'zgarmaydi"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Avatar tanlang</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => setSelectedAvatar(seed)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                        selectedAvatar === seed ? 'border-indigo-600 scale-110 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                      }`}
                    >
                      <img src={getAvatarUrl(seed)} alt={`Avatar ${seed}`} className="w-full h-full bg-slate-100 dark:bg-slate-800 p-1 object-contain" />
                    </button>
                  ))}
                </div>
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

          {accounts && accounts.length > 0 && onSwitchAccount && onAddAccount && onRemoveAccount && (
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId ?? null}
              switchingId={switchingId}
              onSwitch={onSwitchAccount}
              onAdd={onAddAccount}
              onRemove={onRemoveAccount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
