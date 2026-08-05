const fs = require('fs');

let content = fs.readFileSync('src/components/AdminViews.tsx', 'utf-8');

const regex = /interface AdminExpensesViewProps[\s\S]*?export function AdminExpensesView.*?\n\s*return \([\s\S]*?\);\n}/;

const newComponent = `interface AdminExpensesViewProps {
  history: any[];
  students: any[];
  teachers: any[];
}

export function AdminExpensesView({ history, students, teachers }: AdminExpensesViewProps) {
  const [dateFilter, setDateFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [sortBy, setSortBy] = useState('tokens');

  // Group history by student to calculate total tokens used
  const studentTeacherMap = students.reduce((acc, s) => {
    acc[s.username] = s.teacherUsername;
    return acc;
  }, {});

  const filteredHistory = history.filter(item => {
    // 1. Teacher filter
    if (teacherFilter !== 'all') {
      const t = studentTeacherMap[item.studentUsername];
      if (t !== teacherFilter) return false;
    }

    // 2. Date filter
    if (dateFilter !== 'all' && item.createdAt) {
      const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt?.seconds * 1000 || item.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (itemDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (itemDate < monthAgo) return false;
      }
    }
    return true;
  });

  const expenses = filteredHistory.reduce((acc, curr) => {
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
    teacher: studentTeacherMap[student] || "Noma'lum",
    ...expenses[student]
  })).sort((a, b) => {
    if (sortBy === 'requests') {
      return b.requests - a.requests;
    }
    return (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens);
  });

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

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" /> Sana bo'yicha
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
          >
            <option value="all">Barcha vaqt</option>
            <option value="today">Bugun</option>
            <option value="week">Shu hafta</option>
            <option value="month">Shu oy</option>
          </select>
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" /> O'qituvchi bo'yicha
          </label>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
          >
            <option value="all">Barcha o'qituvchilar</option>
            {teachers.map(t => (
              <option key={t.id || t.username} value={t.username}>{t.username}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <ArrowDownUp className="h-3.5 w-3.5" /> Tartiblash
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
          >
            <option value="tokens">Ko'p token sarflaganlar</option>
            <option value="requests">Ko'p so'rov yuborganlar</option>
          </select>
        </div>
      </div>

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
                <th className="px-6 py-4 font-semibold">O'qituvchi</th>
                <th className="px-6 py-4 font-semibold text-right">So'rovlar</th>
                <th className="px-6 py-4 font-semibold text-right">Input Token</th>
                <th className="px-6 py-4 font-semibold text-right">Output Token</th>
                <th className="px-6 py-4 font-semibold text-right">Jami Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expensesArray.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              ) : (
                expensesArray.map((item) => (
                  <tr key={item.student} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {item.student}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/20">
                        {item.teacher}
                      </span>
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
}`;

content = content.replace(regex, newComponent);

fs.writeFileSync('src/components/AdminViews.tsx', content);
