const fs = require('fs');

// 1. Update saveResult type
let dbCode = fs.readFileSync('src/lib/db.ts', 'utf8');
dbCode = dbCode.replace(
  "export const saveResult = async (result: GradingResult) => {",
  "export const saveResult = async (result: GradingResult & { studentUsername?: string, studentName?: string }) => {"
);
fs.writeFileSync('src/lib/db.ts', dbCode);

// 2. Update saveResult call
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "saveResult(data);",
  "saveResult({ ...data, studentUsername: currentUser || 'unknown' });"
);
fs.writeFileSync('src/App.tsx', appCode);

