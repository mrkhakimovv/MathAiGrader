import fs from 'fs';

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// Remove CTA Section
const ctaRegex = /\s*\{\/\* CTA Section \*\/\}\s*<div className="py-section-gap px-gutter bg-background dark:bg-inverse-surface">[\s\S]*?<\/section>/;
content = content.replace(ctaRegex, '\n      </section>');

// Remove Map Section
const mapRegex = /\s*\{\/\* Map Section \*\/\}\s*<div className="mt-section-gap">[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(mapRegex, '');

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log("Removed CTA and Map sections");
