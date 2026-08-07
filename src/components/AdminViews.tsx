import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, Key, Megaphone, Plus, Coins, TrendingUp, Filter, Calendar, ArrowDownUp, Bell, Brain, Wallet, Zap } from 'lucide-react';
import { getAvatarUrl, formatDateUZ } from '../lib/utils';
import { getExpensesResetAt, resetExpensesHistory } from '../lib/db';

interface AdminCreateTeacherViewProps {
  teachers: any[];
  onCreateTeacher: (u: string, p: string) => void;
  onDeleteTeacher: (u: string) => void;
}

export function AdminCreateTeacherView({ teachers, onCreateTeacher, onDeleteTeacher }: AdminCreateTeacherViewProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase();
    value = value.replace(/[^a-z0-9._]/g, '');
    setNewUsername(value);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newPassword.trim()) {
      onCreateTeacher(newUsername.trim(), newPassword.trim());
      setNewUsername('');
      setNewPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          O'qituvchi yaratish
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Yangi o'qituvchilar qo'shish va mavjudlarini boshqarish.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm self-start">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Yangi o'qituvchi
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Login (Username)</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={handleUsernameChange}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="teacher_name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Parol</label>
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
              Yaratish
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Faol O'qituvchilar
          </h2>
          {teachers.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-slate-500 dark:text-slate-400">Hech qanday o'qituvchi topilmadi.</p>
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
                        <Key className="h-3 w-3" /> Parol o'rnatilgan
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) onDeleteTeacher(teacher.id);
                    }}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                    title="O'chirish"
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
  );
}

import { subscribeToCollection, saveToCollection } from '../lib/db';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect } from 'react';

export function AdminAdsView() {
  const [news, setNews] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  useEffect(() => {
    const unsub = subscribeToCollection('news', setNews);
    return () => unsub();
  }, []);

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationText.trim()) return;
    setIsSubmitting(true);
    try {
      const date = formatDateUZ(new Date(), true);
      await saveToCollection('notifications', { content: notificationText.trim(), date, createdAt: Date.now() });
      setNotificationText('');
      setIsNotificationFormOpen(false);
      alert("Xabar muvaffaqiyatli yuborildi!");
    } catch(err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNewsAsNotification = async (newsItem: any) => {
    if (confirm("Ushbu e'lonni hammaga qo'ng'iroqcha orqali yubormoqchimisiz?")) {
      try {
        const date = formatDateUZ(new Date(), true);
        await saveToCollection('notifications', { content: `${newsItem.title}\n\n${newsItem.content}`, date, createdAt: Date.now() });
        alert("Xabar muvaffaqiyatli yuborildi!");
      } catch(err) {
        console.error(err);
        alert("Xatolik yuz berdi");
      }
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      const date = formatDateUZ(new Date(), false);
      await saveToCollection('news', { title: title.trim(), content: content.trim(), date, createdAt: Date.now() });
      setTitle('');
      setContent('');
      setIsFormOpen(false);
    } catch(err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, 'news', id));
      } catch (err) {
        console.error(err);
        alert("Xatolik yuz berdi");
      }
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          Reklama va Yangiliklar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Asosiy sahifadagi e'lonlar va yangiliklarni boshqarish.</p>
      </header>

      {isFormOpen ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Yangi e'lon qo'shish</h2>
          <form onSubmit={handleAddNews} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sarlavha</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Yangi imkoniyatlar qo'shildi!"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Matn</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Yangilik haqida batafsil ma'lumot..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 flex justify-center py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      ) : isNotificationFormOpen ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" />
            Qo'ng'iroqchaga xabar yuborish
          </h2>
          <form onSubmit={handleAddNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Xabar matni</label>
              <textarea
                required
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Foydalanuvchilarga yuboriladigan xabar..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
              </button>
              <button
                type="button"
                onClick={() => setIsNotificationFormOpen(false)}
                className="flex-1 flex justify-center py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap justify-end gap-3">
          <button 
            onClick={() => setIsNotificationFormOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Bell className="h-4 w-4" />
            Xabar yuborish
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Yangi e'lon qo'shish
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {news.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">Hech qanday e'lon mavjud emas.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {news.sort((a, b) => b.createdAt - a.createdAt).map(item => (
              <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 block">{item.createdAt ? formatDateUZ(item.createdAt) : item.date}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{item.content}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleSendNewsAsNotification(item)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Qo'ng'iroqchaga yuborish"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface AdminStudentsViewProps {
  students: any[];
}

export function AdminStudentsView({ students }: AdminStudentsViewProps) {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
          <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          Barcha O'quvchilar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Tizimdagi barcha o'quvchilar ro'yxati.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">O'quvchi</th>
                <th className="px-6 py-4 font-semibold">O'qituvchisi</th>
                <th className="px-6 py-4 font-semibold">Login</th>
                <th className="px-6 py-4 font-semibold">Parol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Hozircha o'quvchilar yo'q.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {student.avatar ? (
                            <img src={getAvatarUrl(student.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-slate-400 text-xs">{(student.firstName || student.username).charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/20">
                        {student.teacherUsername || 'Noma\'lum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      {student.username}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {student.password}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface AdminExpensesViewProps {
  history: any[];
}

// ============================================================
// NARX SOZLAMALARI — Gemini 2.5 Flash ($/million token).
// Narx o'zgarsa (yoki modelni almashtirsangiz) FAQAT shu yerni yangilang.
// Eslatma: thinking token OUTPUT narxida hisoblanadi.
// ============================================================
const PRICE_INPUT_PER_M = 0.30;    // input (million tokenga, $)
const PRICE_OUTPUT_PER_M = 2.50;   // output + thinking (million tokenga, $)
const PRICE_CACHED_PER_M = 0.075;  // cached input (arzon, $)
const USD_TO_UZS = 12650;          // taxminiy kurs (o'zgarsa yangilang)

function calcCostUSD(input: number, output: number, thinking: number, cached: number): number {
  const billableInput = Math.max(0, input - cached);
  return (
    billableInput * PRICE_INPUT_PER_M +
    cached * PRICE_CACHED_PER_M +
    (output + thinking) * PRICE_OUTPUT_PER_M
  ) / 1_000_000;
}

function fmtUSD(v: number): string {
  return `$${v.toFixed(v < 1 ? 4 : 2)}`;
}
function fmtUZS(v: number): string {
  return `${Math.round(v * USD_TO_UZS).toLocaleString()} so'm`;
}

export function AdminExpensesView({ history }: AdminExpensesViewProps) {
  // Xarajat hisobini tozalash (reset) nuqtasi
  const [resetAt, setResetAt] = useState<number>(0);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getExpensesResetAt().then(setResetAt).catch(() => setResetAt(0));
  }, []);

  const handleReset = async () => {
    const ok = window.confirm(
      "Xarajat hisobini tozalamoqchimisiz?\n\n" +
      "Grading tarixi O'CHIRILMAYDI — faqat hisob shu vaqtdan qayta boshlanadi. " +
      "Shundan keyingi o'quvchilar uchun xarajat nol'dan sanaladi."
    );
    if (!ok) return;
    setResetting(true);
    try {
      const now = await resetExpensesHistory();
      setResetAt(now);
    } finally {
      setResetting(false);
    }
  };

  const recMs = (r: any) => (r?.createdAt?.seconds ?? r?.createdAt?._seconds ?? 0) * 1000;

  // Faqat token ma'lumoti bor VA reset nuqtasidan keyingi yozuvlar
  const records = (history || []).filter(
    (h) =>
      h &&
      (h.inputTokens != null || h.outputTokens != null || h.thinkingTokens != null) &&
      (resetAt === 0 || recMs(h) >= resetAt)
  );

  // Oxirgi grading'ni topamiz (createdAt bo'yicha eng yangi)
  const sortedByTime = [...records].sort((a, b) => recMs(b) - recMs(a));
  const latest = sortedByTime[0];
  const latestInput = latest?.inputTokens || 0;
  const latestOutput = latest?.outputTokens || 0;
  const latestThinking = latest?.thinkingTokens || 0;
  const latestCached = latest?.cachedTokens || 0;
  const latestCost = latest ? calcCostUSD(latestInput, latestOutput, latestThinking, latestCached) : 0;

  // O'quvchi bo'yicha guruhlash — REAL token ma'lumoti (soxta emas)
  const expenses = records.reduce((acc: any, curr: any) => {
    const student = curr.studentUsername || 'unknown';
    if (!acc[student]) {
      acc[student] = { inputTokens: 0, outputTokens: 0, thinkingTokens: 0, cachedTokens: 0, requests: 0 };
    }
    acc[student].inputTokens += curr.inputTokens || 0;
    acc[student].outputTokens += curr.outputTokens || 0;
    acc[student].thinkingTokens += curr.thinkingTokens || 0;
    acc[student].cachedTokens += curr.cachedTokens || 0;
    acc[student].requests += 1;
    return acc;
  }, {});

  const expensesArray = Object.keys(expenses).map((student) => {
    const e = expenses[student];
    const cost = calcCostUSD(e.inputTokens, e.outputTokens, e.thinkingTokens, e.cachedTokens);
    return { student, ...e, cost };
  }).sort((a, b) => b.cost - a.cost);

  const totalInput = expensesArray.reduce((s, i) => s + i.inputTokens, 0);
  const totalOutput = expensesArray.reduce((s, i) => s + i.outputTokens, 0);
  const totalThinking = expensesArray.reduce((s, i) => s + i.thinkingTokens, 0);
  const totalCost = expensesArray.reduce((s, i) => s + i.cost, 0);

  // ============================================================
  // SANMA-SANA (kunlik) guruhlash
  // ============================================================
  const dailyMap = records.reduce((acc: any, curr: any) => {
    const ms = recMs(curr);
    if (!ms) return acc;
    const d = new Date(ms);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    if (!acc[key]) {
      acc[key] = { key, label, requests: 0, inputTokens: 0, outputTokens: 0, thinkingTokens: 0, cachedTokens: 0 };
    }
    acc[key].requests += 1;
    acc[key].inputTokens += curr.inputTokens || 0;
    acc[key].outputTokens += curr.outputTokens || 0;
    acc[key].thinkingTokens += curr.thinkingTokens || 0;
    acc[key].cachedTokens += curr.cachedTokens || 0;
    return acc;
  }, {});

  const dailyArray = Object.values(dailyMap).map((d: any) => ({
    ...d,
    cost: calcCostUSD(d.inputTokens, d.outputTokens, d.thinkingTokens, d.cachedTokens),
  })).sort((a: any, b: any) => (a.key < b.key ? 1 : -1)); // eng yangi kun birinchi

  // ============================================================
  // OXIRGI TEKSHIRILGAN VAZIFALAR (eng yangisi yuqorida)
  // ============================================================
  const recentList = sortedByTime.slice(0, 50).map((r: any) => {
    const ms = recMs(r);
    const input = r.inputTokens || 0;
    const output = r.outputTokens || 0;
    const thinking = r.thinkingTokens || 0;
    const cost = calcCostUSD(input, output, thinking, r.cachedTokens || 0);
    let status: { label: string; cls: string };
    if (r.isCorrect) status = { label: "To'g'ri", cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    else if (r.isPartiallyCorrect) status = { label: 'Qisman', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    else status = { label: 'Xato', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
    return {
      id: r.id || `${r.studentUsername}-${ms}`,
      student: r.studentUsername || 'noma\'lum',
      dateLabel: ms ? formatDateUZ(ms, true) : '—',
      score: r.score,
      status,
      input,
      output,
      thinking,
      cost,
    };
  });

  return (
    <div className="space-y-6">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            <Coins className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Xarajatlar (Token sarfi)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">O'quvchilar tomonidan AI orqali tekshirishga sarflangan tokenlar va real xarajat.</p>
          {resetAt > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Hisob {new Date(resetAt).toLocaleString('ru-RU')} dan boshlab yuritilmoqda.
            </p>
          )}
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
          {resetting ? 'Tozalanmoqda...' : 'Hisobni tozalash'}
        </button>
      </header>

      {/* OXIRGI GRADING — yuqorida, ajralib turadi */}
      {latest && (
        <div className="rounded-2xl p-6 shadow-sm bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-100 flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Oxirgi grading xarajati
              </p>
              <p className="text-4xl font-extrabold mt-1">{fmtUSD(latestCost)}</p>
              <p className="text-indigo-200 text-sm mt-0.5">{fmtUZS(latestCost)}</p>
              <p className="text-indigo-100 text-sm mt-2">
                O'quvchi: <span className="font-semibold text-white">{latest.studentUsername || 'noma\'lum'}</span>
                {latest.createdAt && (
                  <span className="text-indigo-200"> · {formatDateUZ(latest.createdAt)}</span>
                )}
              </p>
            </div>
            <div className="hidden sm:grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-indigo-100">Input</p>
                <p className="text-lg font-bold">{latestInput.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-indigo-100">Output</p>
                <p className="text-lg font-bold">{latestOutput.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-indigo-100">Thinking</p>
                <p className="text-lg font-bold">{latestThinking.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JAMI KARTALAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Input</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalInput.toLocaleString()}</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Output</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOutput.toLocaleString()}</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Coins className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Thinking</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalThinking.toLocaleString()}</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Xarajat</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{fmtUSD(totalCost)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{fmtUZS(totalCost)}</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* OXIRGI TEKSHIRILGAN VAZIFALAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Oxirgi tekshirilgan vazifalar</h2>
          {recentList.length > 0 && (
            <span className="text-xs text-slate-400 ml-auto">Eng yangisi yuqorida · {recentList.length} ta</span>
          )}
        </div>
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3.5 font-semibold">O'quvchi</th>
                <th className="px-4 py-3.5 font-semibold">Sana</th>
                <th className="px-4 py-3.5 font-semibold text-center">Holat</th>
                <th className="px-4 py-3.5 font-semibold text-right">Ball</th>
                <th className="px-4 py-3.5 font-semibold text-right">Input</th>
                <th className="px-4 py-3.5 font-semibold text-right">Output</th>
                <th className="px-4 py-3.5 font-semibold text-right">Thinking</th>
                <th className="px-6 py-3.5 font-semibold text-right">Xarajat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Hozircha tekshirilgan vazifa yo'q.</td>
                </tr>
              ) : (
                recentList.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(r.student)} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 bg-slate-100 dark:bg-slate-800" />
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{r.student}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{r.dateLabel}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status.cls}`}>{r.status.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {typeof r.score === 'number' ? r.score : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-600 dark:text-emerald-400">{r.input.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-indigo-600 dark:text-indigo-400">{r.output.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-violet-600 dark:text-violet-400">{r.thinking.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-amber-600 dark:text-amber-400">{fmtUSD(r.cost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SANMA-SANA (KUNLIK) JADVAL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Kunlik xarajat (sanma-sana)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Sana</th>
                <th className="px-6 py-4 font-semibold text-right">Grading</th>
                <th className="px-6 py-4 font-semibold text-right">Input</th>
                <th className="px-6 py-4 font-semibold text-right">Output</th>
                <th className="px-6 py-4 font-semibold text-right">Thinking</th>
                <th className="px-6 py-4 font-semibold text-right">Xarajat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dailyArray.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Hozircha ma'lumot yo'q.
                  </td>
                </tr>
              ) : (
                dailyArray.map((d: any) => (
                  <tr key={d.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{d.label}</td>
                    <td className="px-6 py-4 text-right">{d.requests}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">{d.inputTokens.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-600 dark:text-indigo-400">{d.outputTokens.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-violet-600 dark:text-violet-400">{d.thinkingTokens.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-amber-600 dark:text-amber-400">{fmtUSD(d.cost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JADVAL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">O'quvchilar bo'yicha</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">O'quvchi Login</th>
                <th className="px-6 py-4 font-semibold text-right">So'rovlar</th>
                <th className="px-6 py-4 font-semibold text-right">Input</th>
                <th className="px-6 py-4 font-semibold text-right">Output</th>
                <th className="px-6 py-4 font-semibold text-right">Thinking</th>
                <th className="px-6 py-4 font-semibold text-right">Xarajat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expensesArray.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Hozircha token ma'lumoti bor tekshirish yo'q.
                  </td>
                </tr>
              ) : (
                expensesArray.map((item) => (
                  <tr key={item.student} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {item.student}
                    </td>
                    <td className="px-6 py-4 text-right">{item.requests}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {item.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-600 dark:text-indigo-400">
                      {item.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-violet-600 dark:text-violet-400">
                      {item.thinkingTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      {fmtUSD(item.cost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        * Xarajat Gemini 2.5 Flash narxi bo'yicha taxminiy hisoblangan (thinking = output narxida).
        Eski tekshirishlarda thinking ma'lumoti bo'lmasligi mumkin — faqat yangi grading'lar to'liq aniq.
      </p>
    </div>
  );
}
