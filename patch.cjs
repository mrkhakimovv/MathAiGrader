const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

// add imports
if (!code.includes('react-markdown')) {
    code = `import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
` + code;
}

// replace problemText, solutionSteps, finalAnswer with Markdown
code = code.replace(/<div className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">\s*\{sol.problemText\}\s*<\/div>/g, 
`<div className="text-sm text-slate-700 dark:text-slate-300 mb-2 markdown-body">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.problemText}</Markdown>
                      </div>`);

code = code.replace(/<div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-2">\s*\{sol.solutionSteps\}\s*<\/div>/g, 
`<div className="text-sm text-slate-600 dark:text-slate-400 mb-2 markdown-body">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.solutionSteps}</Markdown>
                      </div>`);

code = code.replace(/<div className="text-sm font-bold text-slate-900 dark:text-white">\s*Javob: \{sol.finalAnswer\}\s*<\/div>/g, 
`<div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Javob: <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.finalAnswer}</Markdown>
                      </div>`);

fs.writeFileSync('src/components/TeacherViews.tsx', code);
