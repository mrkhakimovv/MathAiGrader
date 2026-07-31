import fs from 'fs';

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');
content = content.replace(
  '<section id="aloqa"',
  '</section>\n      <section id="aloqa"'
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log("Fixed missing section tag");
