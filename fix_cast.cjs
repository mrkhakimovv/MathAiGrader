const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

code = code.replace(
  "h.studentName ===",
  "(h as any).studentName ==="
);

fs.writeFileSync('src/components/TeacherViews.tsx', code);
