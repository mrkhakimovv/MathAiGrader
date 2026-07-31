import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `        {((activeView === 'home' && role !== 'student') || activeView === 'grade-task') && (
          <>
            {/* Header */}
            <header className="mb-6 md:mb-10 text-center">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 justify-center">
                <img src="/logo.png" alt="ALMATH Logo" className="h-full w-full rounded-full object-cover" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                {selectedTaskForGrading ? "Vazifani topshirish" : "ALMATH"}
              </h1>
              <p className="mt-2 md:mt-3 text-sm md:text-lg text-slate-600 dark:text-slate-400">
                {selectedTaskForGrading ? \`Siz hozir ushbu vazifani bajaryapsiz: \${selectedTaskForGrading.title}\` : "O'quvchilar uy vazifalarini avtomatik tekshirish tizimi."}
              </p>
            </header>

            <main className="flex flex-col gap-8">
              {!result ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 transition-colors">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {selectedTaskForGrading ? "Yechim faylini yuklang" : "Student Homework Image"}
                      </label>
                      <Uploader
                        selectedFiles={selectedFiles}
                        onFilesSelect={handleFilesSelect}
                        onClear={handleClear}
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-300">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={selectedFiles.length === 0 || isLoading}
                      className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none dark:focus:ring-offset-slate-950"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Tekshirilmoqda...
                        </>
                      ) : (
                        selectedTaskForGrading ? "Vazifani yuborish" : "Grade Homework"
                      )}
                    </button>

                    {selectedTaskForGrading && (
                       <button
                         type="button"
                         onClick={() => {
                           setSelectedTaskForGrading(null);
                           setActiveView('student-tasks');
                         }}
                         className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                       >
                         Boshqa vazifa tanlash
                       </button>
                    )}
                  </form>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ResultCard result={result} onReset={handleReset} />
                </div>
              )}
            </main>
          </>
        )}`;

const newSection = `        {activeView === 'home' && role !== 'student' && (
          <DashboardStats groupDetails={teacherGroupDetails} students={teacherStudents} tasks={teacherTasks} />
        )}

        {activeView === 'grade-task' && (
          <>
            {/* Header */}
            <header className="mb-6 md:mb-10 text-center">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 justify-center">
                <img src="/logo.png" alt="ALMATH Logo" className="h-full w-full rounded-full object-cover" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                Vazifani topshirish
              </h1>
              <p className="mt-2 md:mt-3 text-sm md:text-lg text-slate-600 dark:text-slate-400">
                Siz hozir ushbu vazifani bajaryapsiz: {selectedTaskForGrading?.title}
              </p>
            </header>

            <main className="flex flex-col gap-8">
              {!result ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 transition-colors">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Yechim faylini yuklang
                      </label>
                      <Uploader
                        selectedFiles={selectedFiles}
                        onFilesSelect={handleFilesSelect}
                        onClear={handleClear}
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-300">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={selectedFiles.length === 0 || isLoading}
                      className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none dark:focus:ring-offset-slate-950"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Tekshirilmoqda...
                        </>
                      ) : (
                        "Vazifani yuborish"
                      )}
                    </button>

                    <button
                       type="button"
                       onClick={() => {
                         setSelectedTaskForGrading(null);
                         setActiveView('student-tasks');
                       }}
                       className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                     >
                       Boshqa vazifa tanlash
                     </button>
                  </form>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ResultCard result={result} onReset={handleReset} />
                </div>
              )}
            </main>
          </>
        )}`;

const newContent = content.replace(targetStr, newSection);
if (content === newContent) {
  console.log("Failed to replace");
} else {
  fs.writeFileSync('src/App.tsx', newContent);
  console.log("Updated App.tsx");
}
