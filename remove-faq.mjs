import fs from 'fs';

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// Remove faqData
const faqDataRegex = /const faqData = \[\s*\{[\s\S]*?\];\n\n/;
content = content.replace(faqDataRegex, '');

// Remove FaqAccordionItem
const faqCompRegex = /function FaqAccordionItem\([^\)]+\) \{\s*return \(\s*<div[\s\S]*?<\/div>\s*\);\s*\}\n\n/;
content = content.replace(faqCompRegex, '');

// Remove searchFaq and openFaqIndex state
content = content.replace(/  const \[searchFaq, setSearchFaq\] = useState\(''\);\n/, '');
content = content.replace(/  const \[openFaqIndex, setOpenFaqIndex\] = useState<string \| null>\(null\);\n/, '');

// Replace faq section
const faqSectionStart = content.indexOf('<section id="faq"');
const footerStart = content.indexOf('{/* Footer */}');

if (faqSectionStart !== -1 && footerStart !== -1) {
  const newSection = `
      {/* Abstract Mathematical Motion Section */}
      <section className="py-32 relative overflow-hidden bg-surface dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-tertiary rounded-full blur-3xl" />
        </div>
        <div className="max-w-container-max mx-auto px-gutter relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display-xl text-display-md md:text-display-xl text-on-surface dark:text-inverse-on-surface mb-6">
              Matematika go'zalligi
            </h2>
            <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-16">
              Bizning platformamiz orqali matematika faqat raqamlar emas, balki koinot tilini anglash ekanligini his qilasiz.
            </p>
          </motion.div>

          <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
            {/* Floating Math Symbols */}
            {[
              { sym: '∑', top: '10%', left: '20%', delay: 0 },
              { sym: '∫', top: '70%', left: '15%', delay: 0.2 },
              { sym: 'π', top: '20%', left: '80%', delay: 0.4 },
              { sym: '∞', top: '60%', left: '85%', delay: 0.6 },
              { sym: '√', top: '40%', left: '10%', delay: 0.8 },
              { sym: 'θ', top: '80%', left: '70%', delay: 1.0 },
              { sym: 'λ', top: '30%', left: '50%', delay: 1.2 },
              { sym: 'Δ', top: '15%', left: '40%', delay: 1.4 },
              { sym: 'Ω', top: '85%', left: '40%', delay: 1.6 },
              { sym: 'e', top: '45%', left: '90%', delay: 1.8 }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="absolute text-5xl md:text-7xl font-light text-primary/30 dark:text-primary-fixed-dim/30 select-none"
                style={{ top: item.top, left: item.left }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {item.sym}
              </motion.div>
            ))}
            
            {/* Center abstract form */}
            <motion.div
              className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-primary/40 flex items-center justify-center relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-4 rounded-full border border-tertiary/40" style={{ transform: 'rotate(45deg)' }} />
              <div className="absolute inset-8 rounded-full border border-secondary/40" style={{ transform: 'rotate(90deg)' }} />
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-tertiary blur-xl opacity-50"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      `;
  
  content = content.substring(0, faqSectionStart) + newSection + content.substring(footerStart);
}

// Ensure FaqAccordionItem is also removed if regex missed due to format
if (content.includes("function FaqAccordionItem")) {
  const fqStart = content.indexOf("function FaqAccordionItem");
  const fqEnd = content.indexOf("}", content.indexOf("}", fqStart) + 1) + 1; // get to end of function
  content = content.substring(0, fqStart) + content.substring(fqEnd);
}

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log("FAQ removed and replaced");
