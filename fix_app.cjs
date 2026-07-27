const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "<AllStudentsView \n            students={students}",
  "<AllStudentsView \n            students={students}\n            history={history}"
);

fs.writeFileSync('src/App.tsx', code);
