const fs = require('fs');
let code = fs.readFileSync('src/server/evaluator.ts', 'utf8');

code = code.replace(
    /2\. Compare the number of questions answered by the student with the 'questionCount' in the reference\. If the student missed any questions, state clearly in the 'feedback' that they did not answer all questions \(mentioning how many they answered vs how many were expected\) and reduce the score accordingly\.\\n`;/g,
    `2. Compare the number of questions answered by the student with the 'questionCount' in the reference. If the student missed any questions, state clearly in the 'feedback' that they did not answer all questions (mentioning how many they answered vs how many were expected) and reduce the score accordingly.
3. If the student answered any question incorrectly, you MUST include the true correct solution (haqiqiy yechim) for that specific question in your 'feedback' field, directly taken from the reference material.\\n\`;`
);

fs.writeFileSync('src/server/evaluator.ts', code);
