const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace(
  "onLogin: (username: string, password: string) => boolean;",
  "onLogin: (username: string, password: string) => Promise<boolean> | boolean;"
);

code = code.replace(
  "const handleSubmit = (e: React.FormEvent) => {",
  "const handleSubmit = async (e: React.FormEvent) => {"
);

code = code.replace(
  "const success = onLogin(username.trim(), password);",
  "const success = await onLogin(username.trim(), password);"
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
