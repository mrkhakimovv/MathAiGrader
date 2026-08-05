const fs = require('fs');
let content = fs.readFileSync('src/components/HomeView.tsx', 'utf-8');

// Add state for news
content = content.replace(
  'const [quvonchbekViews, setQuvonchbekViews] = useState<number>(0);',
  'const [quvonchbekViews, setQuvonchbekViews] = useState<number>(0);\n  const [news, setNews] = useState<any[]>([]);'
);

// Add useEffect for fetching news
content = content.replace(
  'useEffect(() => {',
  'useEffect(() => {\n    const unsub = subscribeToCollection("news", setNews);\n    return () => unsub();\n  }, []);\n\n  useEffect(() => {'
);

// Replace hardcoded news section
const newsRegex = /<div className="space-y-6">([\s\S]*?)<button className="flex items-center gap-2/m;
const newsReplacement = `<div className="space-y-6">
            {news.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">Hozircha yangiliklar yo'q.</p>
            ) : (
              news.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3).map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 block">{item.date}</span>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 whitespace-pre-wrap">{item.content}</p>
                </div>
              ))
            )}
                        
            <button className="flex items-center gap-2`;

content = content.replace(newsRegex, newsReplacement);

fs.writeFileSync('src/components/HomeView.tsx', content);
