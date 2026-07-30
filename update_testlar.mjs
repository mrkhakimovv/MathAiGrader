import fs from 'fs';
let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const startTag = '      <section id="testlar"';
const endTag = '      <section id="biz-haqimizda"';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag, startIdx);

const replacement = fs.readFileSync('/tmp/patch_testlar.tsx', 'utf8');

const newContent = content.substring(0, startIdx) + replacement + '\n' + content.substring(endIdx);

fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log('Updated testlar section');
