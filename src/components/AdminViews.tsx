import React, { useState } from 'react';
import { UserPlus, Users, Trash2, Key, Megaphone, Plus, Coins, TrendingUp, Filter, Calendar, ArrowDownUp } from 'lucide-react';
import { getAvatarUrl } from '../lib/utils';

interface AdminCreateTeacherViewProps {
  teachers: any[];
  onCreateTeacher: (u: string, p: string) => void;
  onDeleteTeacher: (u: string) => void;
}

export function AdminCreateTeacherView({ teachers, onCreateTeacher, onDeleteTeacher }: AdminCreateTeacherViewProps) {
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
                onChange={(e) => setNewUsername(e.target.value)}
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

  useEffect(() => {
    const unsub = subscribeToCollection('news', setNews);
    return () => unsub();
  }, []);

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      const date = new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
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
      ) : (
        <div className="mb-6 flex justify-end">
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
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 block">{item.date}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{item.content}</p>
                </div>
                <div className="shrink-0">
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

export function AdminExpensesView({ history }: AdminExpensesViewProps) {
  // Group history by student to calculate total tokens used
  const expenses = history.reduce((acc, curr) => {
    const student = curr.studentUsername;
    if (!acc[student]) {
      acc[student] = { 
        inputTokens: 0, 
        outputTokens: 0, 
        requests: 0 
      };
    }
    // Simulate token usage based on grading result length or mock data if not available
    // Assuming each grading request takes roughly 1500 input tokens and 500 output tokens on average if not recorded
    acc[student].inputTokens += curr.inputTokens || 1500;
    acc[student].outputTokens += curr.outputTokens || 500;
    acc[student].requests += 1;
    return acc;
  }, {});

  const expensesArray = Object.keys(expenses).map(student => ({
    student,
    ...expenses[student]
  })).sort((a, b) => (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens));

  const totalInput = expensesArray.reduce((sum, item) => sum + item.inputTokens, 0);
  const totalOutput = expensesArray.reduce((sum, item) => sum + item.outputTokens, 0);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
          <Coins className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          Xarajatlar (Token sarfi)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">O'quvchilar tomonidan AI orqali tekshirishga sarflangan tokenlar statistikasi.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Input Tokenlar</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalInput.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Output Tokenlar</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOutput.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Coins className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">O'quvchi Login</th>
                <th className="px-6 py-4 font-semibold text-right">So'rovlar</th>
                <th className="px-6 py-4 font-semibold text-right">Input Token</th>
                <th className="px-6 py-4 font-semibold text-right">Output Token</th>
                <th className="px-6 py-4 font-semibold text-right">Jami Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expensesArray.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Hozircha tekshirishlar amalga oshirilmagan.
                  </td>
                </tr>
              ) : (
                expensesArray.map((item) => (
                  <tr key={item.student} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {item.student}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.requests}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {item.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-600 dark:text-indigo-400">
                      {item.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      {(item.inputTokens + item.outputTokens).toLocaleString()}
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
