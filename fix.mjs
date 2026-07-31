import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const target = '      <section id="testlar" className="pt-24';
const replacement = '        </section>\n      </section>\n      <section id="testlar" className="pt-24';

const newContent = content.replace(target, replacement);
fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Fixed sections");
