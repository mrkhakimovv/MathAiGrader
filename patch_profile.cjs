const fs = require('fs');
let code = fs.readFileSync('src/components/qollanma/ProfileModal.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { getAvatarUrl, AVATAR_SEEDS } from '../../lib/utils';",
  "import { getAvatarUrl, AVATAR_SEEDS } from '../../lib/utils';\nimport { AccountSwitcher } from '../AccountSwitcher';\nimport { StoredAccount } from '../../lib/accounts';"
);

// Add props
code = code.replace(
  "onUsernameChange?: (newUsername: string) => void;\n}",
  "onUsernameChange?: (newUsername: string) => void;\n  accounts?: StoredAccount[];\n  activeAccountId?: string | null;\n  switchingId?: string | null;\n  onSwitchAccount?: (id: string) => void;\n  onAddAccount?: () => void;\n  onRemoveAccount?: (id: string) => void;\n}"
);

code = code.replace(
  "export function ProfileModal({ isOpen, onClose, history, isDarkMode, toggleDarkMode, username, onLogout, userRole, studentInfo, tasks = [], onUsernameChange }: ProfileModalProps) {",
  "export function ProfileModal({ isOpen, onClose, history, isDarkMode, toggleDarkMode, username, onLogout, userRole, studentInfo, tasks = [], onUsernameChange, accounts = [], activeAccountId, switchingId, onSwitchAccount, onAddAccount, onRemoveAccount }: ProfileModalProps) {"
);

const accountSwitcherUi = `
          {accounts && accounts.length > 0 && onSwitchAccount && onAddAccount && onRemoveAccount && (
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId ?? null}
              switchingId={switchingId}
              onSwitch={onSwitchAccount}
              onAdd={onAddAccount}
              onRemove={onRemoveAccount}
            />
          )}
`;

code = code.replace(
  "          {/* Settings */}",
  `${accountSwitcherUi}\n          {/* Settings */}`
);

fs.writeFileSync('src/components/qollanma/ProfileModal.tsx', code);
