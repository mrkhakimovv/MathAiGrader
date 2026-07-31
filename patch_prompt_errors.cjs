const fs = require('fs');
let code = fs.readFileSync('src/server/evaluator.ts', 'utf8');

code = code.replace(
    /3\. If the student answered any question incorrectly, you MUST include the true correct solution \(haqiqiy yechim\) for that specific question in your 'feedback' field, directly taken from the reference material\.\\n`;/g,
    `3. If the student answered any question incorrectly, you MUST provide a detailed explanation of their mistake and the complete correct step-by-step solution (haqiqiy yechim) directly taken from the reference material. Place this detailed breakdown inside the 'errorSteps' array for each wrong question.\\n\`;`
);

code = code.replace(
    /description: "A list of specific steps where the student made an error, if any.",/g,
    `description: "A list of specific errors the student made. For each error, clearly state the problem number, explain the mistake, and provide the complete correct step-by-step solution based on the teacher's reference. Use Markdown and LaTeX.",`
);

fs.writeFileSync('src/server/evaluator.ts', code);
