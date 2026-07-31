import fs from 'fs';
let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const mathSectionRegex = /\s*\{\/\* Abstract Mathematical Motion Section \*\/\}\s*<section className="py-32 relative overflow-hidden bg-surface dark:bg-inverse-surface border-t border-outline-variant\/20">[\s\S]*?<\/section>/;

content = content.replace(mathSectionRegex, '');

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log("Removed math section");
