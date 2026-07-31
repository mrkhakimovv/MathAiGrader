const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

code = code.replace(
    /const groupTasks = tasks\.filter\(t => t\.group === selectedGroup\?\.name \|\| !t\.group \|\| t\.group === 'Barcha guruhlar' \|\| t\.group === ''\)\.sort[^\n]+/g,
    `const groupTasks = tasks.filter(t => t.group === selectedGroup?.name || !t.group || t.group === 'Barcha guruhlar' || t.group === '').sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));`
);

fs.writeFileSync('src/components/TeacherViews.tsx', code);
