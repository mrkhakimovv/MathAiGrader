const fs = require('fs');
let code = fs.readFileSync('src/components/qollanma/LoginScreen.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { Calculator, Lock, User as UserIcon, Moon, Sun, ArrowLeft } from 'lucide-react';",
  "import { Calculator, Lock, User as UserIcon, Moon, Sun, ArrowLeft } from 'lucide-react';\nimport { AccountSwitcher } from '../AccountSwitcher';\nimport { StoredAccount } from '../../lib/accounts';"
);

// Add props
code = code.replace(
  "onBack?: () => void;\n}",
  "onBack?: () => void;\n  accounts?: StoredAccount[];\n  activeAccountId?: string | null;\n  switchingId?: string | null;\n  onSwitchAccount?: (id: string) => void;\n  onRemoveAccount?: (id: string) => void;\n}"
);

code = code.replace(
  "export function LoginScreen({ onLogin, isDarkMode, toggleDarkMode, onBack }: LoginScreenProps) {",
  "export function LoginScreen({ onLogin, isDarkMode, toggleDarkMode, onBack, accounts = [], activeAccountId, switchingId, onSwitchAccount, onRemoveAccount }: LoginScreenProps) {"
);

const accountsUi = `
        {accounts.length > 0 && onSwitchAccount && onRemoveAccount && (
          <div className="mt-8">
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId ?? null}
              switchingId={switchingId}
              onSwitch={onSwitchAccount}
              onAdd={() => {}} // Disabled in login screen, user is already adding
              onRemove={onRemoveAccount}
            />
            <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 dark:before:border-slate-700 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200 dark:after:border-slate-700">
              <p className="mx-4 mb-0 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">YOKI</p>
            </div>
          </div>
        )}
`;

code = code.replace(
  "<div className=\"text-center mb-8\">",
  `${accountsUi}\n        <div className=\"text-center mb-8\">`
);

fs.writeFileSync('src/components/qollanma/LoginScreen.tsx', code);
