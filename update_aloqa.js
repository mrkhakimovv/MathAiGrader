const fs = require('fs');
let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const startTag = '<section id="aloqa"';
const endTag = '      <section id="faq"';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag, startIdx);

const replacement = fs.readFileSync('/tmp/patch_aloqa.tsx', 'utf8');

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);

fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log('Updated');
