import fs from 'fs';
let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const startTag = '      <section id="kurslar"';
const endTag = '      <section id="testlar"';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag, startIdx);

const replacement = fs.readFileSync('/tmp/patch_kurslar.tsx', 'utf8');

const newContent = content.substring(0, startIdx) + replacement + '\n' + content.substring(endIdx);

fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log('Updated kurslar section');
