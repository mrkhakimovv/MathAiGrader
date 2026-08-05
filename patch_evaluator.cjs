const fs = require('fs');
let content = fs.readFileSync('src/server/evaluator.ts', 'utf-8');

content = content.replace(
  '  return result;\n}',
  '  result.inputTokens = response?.usageMetadata?.promptTokenCount || 0;\n  result.outputTokens = response?.usageMetadata?.candidatesTokenCount || 0;\n  return result;\n}'
);

fs.writeFileSync('src/server/evaluator.ts', content);
