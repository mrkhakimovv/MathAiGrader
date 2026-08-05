const fs = require('fs');
let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// Add import
content = content.replace(
  "import { doc, getDoc } from 'firebase/firestore';",
  "import { doc, getDoc } from 'firebase/firestore';\nimport { subscribeToCollection } from '../lib/db';\nimport { Newspaper } from 'lucide-react';"
);

// Add state & effect
content = content.replace(
  'const [quvonchbekViews, setQuvonchbekViews] = useState<number>(0);',
  'const [quvonchbekViews, setQuvonchbekViews] = useState<number>(0);\n  const [news, setNews] = useState<any[]>([]);\n\n  useEffect(() => {\n    const unsub = subscribeToCollection("news", setNews);\n    return () => unsub();\n  }, []);'
);

// Add News Section
const newsSection = `
      {news.length > 0 && (
        <section className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-surface dark:bg-inverse-surface">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-6">
                <Newspaper className="w-4 h-4" /> E'lonlar va Yangiliklar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-inverse-on-surface mb-4">So'nggi yangiliklardan xabardor bo'ling</h2>
              <p className="text-on-surface-variant dark:text-inverse-on-surface-variant mb-6 text-lg">ALMATH platformasidagi eng so'nggi yangiliklar, o'zgarishlar va e'lonlar.</p>
            </div>
            <div className="md:w-2/3 grid gap-6">
              {news.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3).map((item) => (
                <div key={item.id} className="bg-surface-container-low dark:bg-surface-container-highest p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 block">{item.date}</span>
                  <h3 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface mb-3">{item.title}</h3>
                  <p className="text-on-surface-variant dark:text-inverse-on-surface-variant whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
`;

content = content.replace(
  '{/* Sections for Navigation Links */}',
  newsSection + '\n      {/* Sections for Navigation Links */}'
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
