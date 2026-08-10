/**
 * ALMATH - Ko'p akkauntli tizim (Telegram uslubida)
 * ------------------------------------------------
 * Foydalanuvchi bir nechta akkauntni (o'quvchi / o'qituvchi / admin) saqlab qo'yib,
 * parol kiritmasdan ular o'rtasida almashishi mumkin.
 *
 * DIQQAT (xavfsizlik): parollar brauzerdagi localStorage'da saqlanadi.
 * Bu — Telegram'dagi kabi "tez almashish" imkonini beradi, lekin haqiqiy
 * xavfsizlik emas. Kelajakda Firebase Auth (token asosida) ga o'tilganda
 * `secret` maydonini token bilan almashtirish kifoya — qolgan mantiq o'zgarmaydi.
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface StoredAccount {
  /** Unikal kalit: `${role}:${username}` */
  id: string;
  username: string;
  role: UserRole;
  /** Firestore hujjat IDsi (o'quvchi/o'qituvchi uchun) */
  docId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  /** Obfuskatsiya qilingan parol. Bo'sh bo'lsa — qayta login talab qilinadi. */
  secret?: string;
  addedAt: number;
  lastActiveAt: number;
}

const ACCOUNTS_KEY = 'almath_accounts';
const ACTIVE_KEY = 'almath_active_account';
const LEGACY_USER_KEY = 'almath_user';

/** Telegram'dagi kabi cheklov. Kerak bo'lsa shu raqamni o'zgartiring. */
export const MAX_ACCOUNTS = 4;

/* ------------------------------------------------------------------ */
/* Parolni oddiy obfuskatsiya qilish (XOR + base64).                   */
/* Bu shifrlash EMAS — faqat localStorage'da ochiq matn ko'rinmasligi  */
/* uchun.                                                              */
/* ------------------------------------------------------------------ */
const XOR_KEY = 'almath.v1';

function xor(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(input.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return out;
}

export function encodeSecret(plain: string): string {
  if (!plain) return '';
  try {
    return btoa(unescape(encodeURIComponent(xor(plain))));
  } catch {
    return '';
  }
}

export function decodeSecret(encoded?: string): string {
  if (!encoded) return '';
  try {
    return xor(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/* CRUD                                                                */
/* ------------------------------------------------------------------ */

export function makeAccountId(role: UserRole, username: string): string {
  return `${role}:${username.trim().toLowerCase()}`;
}

export function getAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((a: any) => a && a.id && a.username && a.role);
  } catch {
    return [];
  }
}

function persist(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Akkauntlarni saqlashda xatolik:', e);
  }
}

export function getActiveAccountId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveAccountId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch (e) {
    console.error(e);
  }
}

export function getAccount(id: string): StoredAccount | undefined {
  return getAccounts().find((a) => a.id === id);
}

export function findAccount(role: UserRole, username: string): StoredAccount | undefined {
  return getAccount(makeAccountId(role, username));
}

/** Akkauntni qo'shadi yoki mavjudini yangilaydi. */
export function upsertAccount(input: {
  username: string;
  role: UserRole;
  password?: string;
  docId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}): StoredAccount {
  const accounts = getAccounts();
  const id = makeAccountId(input.role, input.username);
  const now = Date.now();
  const existing = accounts.find((a) => a.id === id);

  const account: StoredAccount = {
    id,
    username: input.username.trim(),
    role: input.role,
    docId: input.docId ?? existing?.docId,
    firstName: input.firstName ?? existing?.firstName,
    lastName: input.lastName ?? existing?.lastName,
    avatar: input.avatar ?? existing?.avatar,
    secret: input.password !== undefined ? encodeSecret(input.password) : existing?.secret,
    addedAt: existing?.addedAt ?? now,
    lastActiveAt: now,
  };

  const next = existing
    ? accounts.map((a) => (a.id === id ? account : a))
    : [...accounts, account];

  persist(next);
  return account;
}

/** Faqat profil ma'lumotlarini yangilaydi (ism, avatar, username o'zgarganda). */
export function patchAccount(id: string, patch: Partial<StoredAccount>): StoredAccount[] {
  const accounts = getAccounts();
  let next = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));

  // Username o'zgargan bo'lsa — id ham yangilanadi
  if (patch.username) {
    const target = next.find((a) => a.id === id);
    if (target) {
      const newId = makeAccountId(target.role, patch.username);
      if (newId !== id) {
        next = next.filter((a) => a.id !== newId || a.id === id);
        next = next.map((a) => (a.id === id ? { ...a, id: newId } : a));
        if (getActiveAccountId() === id) setActiveAccountId(newId);
      }
    }
  }

  persist(next);
  return next;
}

export function removeAccount(id: string): StoredAccount[] {
  const next = getAccounts().filter((a) => a.id !== id);
  persist(next);
  if (getActiveAccountId() === id) setActiveAccountId(null);
  return next;
}

export function clearAccounts() {
  try {
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch (e) {
    console.error(e);
  }
}

/** Eng oxirgi ishlatilgan akkaunt (joriysidan tashqari). */
export function getNextAccount(excludeId?: string): StoredAccount | undefined {
  return getAccounts()
    .filter((a) => a.id !== excludeId)
    .sort((a, b) => b.lastActiveAt - a.lastActiveAt)[0];
}

/* ------------------------------------------------------------------ */
/* Eski (bir akkauntli) tizimdan migratsiya                            */
/* ------------------------------------------------------------------ */

/**
 * Ilova avval `almath_user` kalitida bitta foydalanuvchini saqlagan.
 * Yangilanishdan keyin foydalanuvchi tizimdan chiqib ketmasligi uchun
 * o'sha yozuvni akkauntlar ro'yxatiga ko'chiramiz.
 */
export function migrateLegacyUser(): StoredAccount | null {
  try {
    const raw = localStorage.getItem(LEGACY_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.username || !user?.role) return null;

    const id = makeAccountId(user.role, user.username);
    const existing = getAccount(id);
    if (existing) {
      if (!getActiveAccountId()) setActiveAccountId(existing.id);
      return existing;
    }

    const account = upsertAccount({
      username: user.username,
      role: user.role,
      password: typeof user.password === 'string' ? user.password : undefined,
      docId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    });
    setActiveAccountId(account.id);
    return account;
  } catch (e) {
    console.error('Legacy user migratsiyasida xatolik:', e);
    return null;
  }
}

/** Akkauntning ko'rsatiladigan nomi. */
export function accountDisplayName(a: StoredAccount): string {
  const full = `${a.firstName || ''} ${a.lastName || ''}`.trim();
  return full || a.username;
}

export function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : role === 'teacher' ? "O'qituvchi" : "O'quvchi";
}
