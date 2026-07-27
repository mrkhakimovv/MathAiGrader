const fs = require('fs');
let code = fs.readFileSync('src/components/StudentRegistration.tsx', 'utf8');

code = code.replace(
  "const [phone, setPhone] = useState('');",
  "const [phone, setPhone] = useState('');\n  const [username, setUsername] = useState('');\n  const [password, setPassword] = useState('');"
);

code = code.replace(
  "if (!firstName.trim() || !lastName.trim() || !phone.trim()) {",
  "if (!firstName.trim() || !lastName.trim() || !phone.trim() || !username.trim() || !password.trim()) {"
);

code = code.replace(
  "phone: phone.trim(),",
  "phone: phone.trim(),\n        username: username.trim(),\n        password: password.trim(),"
);

code = code.replace(
  "disabled={isLoading || !firstName || !lastName || !phone}",
  "disabled={isLoading || !firstName || !lastName || !phone || !username || !password}"
);

// We need to add the input fields
const phoneInputBlock = `          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Telefon raqam
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="+998 90 123 45 67"
              disabled={isLoading}
            />
          </div>`;

const newFields = `          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Foydalanuvchi nomi (Username)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Username kiriting"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Parol
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Parol kiriting"
              disabled={isLoading}
            />
          </div>`;

code = code.replace(phoneInputBlock, phoneInputBlock + "\n\n" + newFields);

fs.writeFileSync('src/components/StudentRegistration.tsx', code);
