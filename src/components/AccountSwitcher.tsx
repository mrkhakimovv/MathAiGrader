import React, { useState } from 'react';
import { Check, Loader2, Plus, Trash2, Users2 } from 'lucide-react';
import { getAvatarUrl } from '../lib/utils';
import {
  StoredAccount,
  MAX_ACCOUNTS,
  accountDisplayName,
  roleLabel,
} from '../lib/accounts';

interface AccountSwitcherProps {
  accounts: StoredAccount[];
  activeAccountId: string | null;
  switchingId?: string | null;
  onSwitch: (id: string) => void;
  onAdd?: () => void;
  onRemove: (id: string) => void;
}

function AccountAvatar({ account, size = 'md' }: { account: StoredAccount; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const ring =
    account.role === 'admin'
      ? 'border-amber-300 dark:border-amber-500/60'
      : account.role === 'teacher'
      ? 'border-emerald-300 dark:border-emerald-500/60'
      : 'border-indigo-200 dark:border-indigo-700';

  return (
    <div
      className={`${box} shrink-0 rounded-full overflow-hidden border-2 ${ring} bg-indigo-50 dark:bg-slate-800 flex items-center justify-center`}
    >
      {account.avatar ? (
        <img
          src={getAvatarUrl(account.avatar)}
          alt={accountDisplayName(account)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300 uppercase">
          {accountDisplayName(account).charAt(0)}
        </span>
      )}
    </div>
  );
}

export function AccountSwitcher({
  accounts,
  activeAccountId,
  switchingId,
  onSwitch,
  onAdd,
  onRemove,
}: AccountSwitcherProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sorted = [...accounts].sort((a, b) => {
    if (a.id === activeAccountId) return -1;
    if (b.id === activeAccountId) return 1;
    return b.lastActiveAt - a.lastActiveAt;
  });

  const isFull = accounts.length >= MAX_ACCOUNTS;

  return (
    <section>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
        <Users2 className="h-4 w-4" />
        Akkauntlar
        <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
          {accounts.length}/{MAX_ACCOUNTS}
        </span>
      </h4>

      <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
        {sorted.map((account) => {
          const isActive = account.id === activeAccountId;
          const isSwitching = switchingId === account.id;
          const needsPassword = !account.secret;

          if (confirmId === account.id) {
            return (
              <div
                key={account.id}
                className="p-3 bg-rose-50 dark:bg-rose-900/20 animate-in fade-in duration-150"
              >
                <p className="text-xs text-rose-700 dark:text-rose-300 mb-3 leading-relaxed">
                  <span className="font-bold">{accountDisplayName(account)}</span> akkaunti ro'yxatdan
                  o'chiriladi. Qayta kirish uchun login va parol kerak bo'ladi.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onRemove(account.id);
                      setConfirmId(null);
                    }}
                    className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
                  >
                    O'chirish
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={account.id}
              className={`group flex items-center gap-3 p-3 transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : 'hover:bg-white dark:hover:bg-slate-700/50'
              }`}
            >
              <button
                onClick={() => !isActive && !isSwitching && onSwitch(account.id)}
                disabled={isActive || !!switchingId}
                className="flex flex-1 items-center gap-3 text-left min-w-0 disabled:cursor-default"
              >
                <AccountAvatar account={account} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {accountDisplayName(account)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    @{account.username} · {roleLabel(account.role)}
                    {needsPassword && !isActive && (
                      <span className="text-amber-600 dark:text-amber-400"> · parol so'raladi</span>
                    )}
                  </p>
                </div>
              </button>

              {isSwitching ? (
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500 shrink-0" />
              ) : isActive ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              ) : (
                <button
                  onClick={() => setConfirmId(account.id)}
                  title="Akkauntni o'chirish"
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}

        {onAdd && (
          <button
            onClick={onAdd}
            disabled={isFull || !!switchingId}
            className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-white dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="h-11 w-11 shrink-0 rounded-full border-2 border-dashed border-indigo-300 dark:border-indigo-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Plus className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Akkaunt qo'shish
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {isFull
                  ? `Maksimum ${MAX_ACCOUNTS} ta akkaunt`
                  : 'Boshqa login bilan kiring, joriy akkaunt saqlanadi'}
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

export { AccountAvatar };
