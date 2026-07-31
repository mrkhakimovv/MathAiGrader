import fs from 'fs';

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// The botched part is between `toggleDarkMode: () => void;\n}` and `export function WelcomeScreen`.
const startIdx = content.indexOf(') {');
const exportIdx = content.indexOf('export function WelcomeScreen');
if (startIdx < exportIdx) {
  content = content.substring(0, startIdx) + content.substring(exportIdx);
}
fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log("Fixed");
