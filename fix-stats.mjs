import fs from 'fs';
let content = fs.readFileSync('src/components/DashboardStats.tsx', 'utf-8');
content = content.replace(/\\`\\\${percentage}%\\`/g, '`${percentage}%`');
fs.writeFileSync('src/components/DashboardStats.tsx', content);
console.log("Fixed stats");
