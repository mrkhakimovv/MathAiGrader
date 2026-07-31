const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

// Add state for selected task analysis
if (!code.includes('selectedTaskAnalysis')) {
    code = code.replace(
        "const [activeTab, setActiveTab] = useState<'students' | 'tasks' | 'all-students'>('students');",
        "const [activeTab, setActiveTab] = useState<'students' | 'tasks' | 'all-students'>('students');\n  const [selectedTaskAnalysis, setSelectedTaskAnalysis] = useState<any>(null);"
    );
}

// Make the task row clickable
code = code.replace(
    /key=\{task\.id \|\| idx\}\s*className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700\/50 bg-white dark:bg-slate-800\/50 hover:border-indigo-300 dark:hover:border-indigo-500\/50 transition-colors"/g,
    `key={task.id || idx}
                            onClick={() => {
                              if (task.teacherAnalysis) {
                                setSelectedTaskAnalysis(task);
                              }
                            }}
                            className={\`flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors \${task.teacherAnalysis ? 'cursor-pointer' : ''}\`}`
);

// Add modal for selectedTaskAnalysis at the end of AllGroupsView
const modalCode = `
      {selectedTaskAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {selectedTaskAnalysis.title} - Tahlil
              </h3>
              <button 
                onClick={() => setSelectedTaskAnalysis(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedTaskAnalysis.teacherAnalysis?.solutions?.map((sol: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div className="font-semibold text-slate-900 dark:text-white mb-2">
                        {sol.problemNumber}-savol
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 markdown-body">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.problemText}</Markdown>
                      </div>
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Yechim:</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 markdown-body">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.solutionSteps}</Markdown>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Javob: <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.finalAnswer}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTaskAnalysis(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
`;

// Insert the modal right before the last closing div of AllGroupsView
// Search for the last </div> before the end of the function.
const allGroupsEndRegex = /(<\/div>\s*)(\);\s*\}\s*)$/;
code = code.replace(allGroupsEndRegex, modalCode + "$1$2");

fs.writeFileSync('src/components/TeacherViews.tsx', code);
