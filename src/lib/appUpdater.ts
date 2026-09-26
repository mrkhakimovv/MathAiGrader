/**
 * Application Update & Cache Management Utility
 * Dasturni yangilash, keshni tozalash va PWA yangilanishlarini qabul qilish moduli
 */

const STORAGE_KEY_BUILD_HASH = 'almath_loaded_build_hash';
const STORAGE_KEY_LAST_CHECK = 'almath_last_update_check';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion?: string;
  latestVersion?: string;
  reason?: 'service_worker' | 'build_hash' | 'script_tags' | 'server_start' | 'manifest';
  message: string;
}

// Hozirgi yuklangan sahifadagi script va css fayllar ro'yxatini olish
function getLoadedAssetHrefs(): string[] {
  if (typeof document === 'undefined') return [];
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
    .map((s) => s.getAttribute('src') || '')
    .filter(Boolean);
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .map((l) => l.getAttribute('href') || '')
    .filter(Boolean);
  return [...scripts, ...links];
}

/**
 * PWA o'rnatilganligini (standalone rejimini) tekshirish
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  return isStandalone || isIOSStandalone;
}

/**
 * Ilova ilk bor yuklanganda versiya identifikatorini xotiraga yozadi
 */
export async function initAppVersionTracking(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const res = await fetch(`/api/version?_init=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.buildHash && !sessionStorage.getItem(STORAGE_KEY_BUILD_HASH)) {
        sessionStorage.setItem(STORAGE_KEY_BUILD_HASH, String(data.buildHash));
      }
    }
  } catch {
    // offline yoki tarmoq xatosi bo'lsa e'tiborsiz qoldiramiz
  }
}

/**
 * Yangilanishlar bor yoki yo'qligini to'liq tekshirish:
 * 1. Service Worker registration holati (waiting/installing)
 * 2. Backend /api/version buildHash farqi
 * 3. Yangi index.html dagi script/link teglari farqi
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  const now = Date.now();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, String(now));
  }

  // 1. Service Worker tekshiruvi (PWA / Workbox)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update();
        if (reg.waiting || reg.installing) {
          return {
            hasUpdate: true,
            reason: 'service_worker',
            message: "Yangi versiya topildi! (PWA yangilanishi)",
          };
        }
      }
    } catch (e) {
      console.warn("ServiceWorker update check warning:", e);
    }
  }

  // 2. /api/version orqali tekshirish
  try {
    const res = await fetch(`/api/version?_t=${now}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    if (res.ok) {
      const data = await res.json();
      const currentStored = sessionStorage.getItem(STORAGE_KEY_BUILD_HASH);
      
      if (currentStored && data?.buildHash && String(data.buildHash) !== currentStored) {
        return {
          hasUpdate: true,
          currentVersion: currentStored,
          latestVersion: String(data.buildHash),
          reason: 'build_hash',
          message: "Dastur kodi yangilangan!",
        };
      } else if (!currentStored && data?.buildHash) {
        sessionStorage.setItem(STORAGE_KEY_BUILD_HASH, String(data.buildHash));
      }
    }
  } catch (e) {
    console.warn("API version check warning:", e);
  }

  // 3. index.html skriptlarini yangidan yuklab solishtirish
  try {
    const htmlRes = await fetch(`/?_upd_chk=${now}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    if (htmlRes.ok) {
      const htmlText = await htmlRes.text();
      const currentAssets = getLoadedAssetHrefs();

      const scriptMatches = Array.from(htmlText.matchAll(/src=["'](\/assets\/[^"']+)["']/g)).map(m => m[1]);
      const cssMatches = Array.from(htmlText.matchAll(/href=["'](\/assets\/[^"']+)["']/g)).map(m => m[1]);
      const newAssets = [...scriptMatches, ...cssMatches];

      if (newAssets.length > 0 && currentAssets.length > 0) {
        const hasDifferentAsset = newAssets.some(newAsset => !currentAssets.includes(newAsset));
        if (hasDifferentAsset) {
          return {
            hasUpdate: true,
            reason: 'script_tags',
            message: "Yangi dastur paketi aniqlandi!",
          };
        }
      }
    }
  } catch (e) {
    console.warn("Index HTML asset diff check warning:", e);
  }

  return {
    hasUpdate: false,
    message: "Dastur barcha yangilanishlarni qabul qilishga tayyor!",
  };
}

/**
 * Dasturni to'liq yangilash:
 * - Barcha Service Worker va PWA keshlarini tozalash
 * - Yangi Web App Manifest, logo va nom sozlamalarini qayta yuklash
 * - Yangi build paketlarini qabul qilish
 * - Sahifani to'liq hard reload qilish
 */
export async function applyUpdateAndReload(onProgress?: (msg: string) => void): Promise<void> {
  const now = Date.now();

  try {
    onProgress?.("Kesh va PWA xotirasi tozalanmoqda...");

    // 1. Service Workerlarni tekshirish, skipWaiting va tozalash
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          if (reg.installing) {
            reg.installing.postMessage({ type: 'SKIP_WAITING' });
          }
          try {
            await reg.update();
          } catch {
            // ignore
          }
          try {
            await reg.unregister();
          } catch {
            // ignore
          }
        }
      } catch (swErr) {
        console.warn("SW cleanup notice:", swErr);
      }
    }

    // 2. CacheStorage (barcha offline va asset keshlarini to'liq o'chirish)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      } catch (cacheErr) {
        console.warn("CacheStorage delete notice:", cacheErr);
      }
    }

    onProgress?.("Yangi dastur nomi, logo va barcha imkoniyatlar yuklanmoqda...");

    // 3. Manifest va logoni majburiy yangilab olish (PWA va brauzer uchun)
    try {
      const manifestRes = await fetch(`/manifest.webmanifest?_pwa_upd=${now}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      }).catch(() => null);

      if (manifestRes && manifestRes.ok) {
        const manifestData = await manifestRes.json().catch(() => null);
        if (manifestData?.name && typeof document !== 'undefined') {
          document.title = manifestData.name;
        }
      }
    } catch {
      // ignore
    }

    // Logoni majburiy keshdan tozalab yangilash
    try {
      await fetch(`/logo.png?_logo_upd=${now}`, {
        cache: 'reload',
        headers: { 'Cache-Control': 'no-cache, no-store' }
      }).catch(() => null);

      // DOM dagi faviconga va logoga yangi cache-buster qo'yish
      if (typeof document !== 'undefined') {
        const icons = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');
        icons.forEach(icon => {
          icon.href = `/logo.png?v=${now}`;
        });
      }
    } catch {
      // ignore
    }

    // 4. Session va Local xotiradagi eski versiya identifikatorlarini tozalash
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_BUILD_HASH);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_BUILD_HASH);
      localStorage.setItem('almath_last_force_update', String(now));
    }

    onProgress?.("Dastur to'liq yangilandi! Qayta ishga tushirilmoqda...");
  } catch (err) {
    console.error("Xatolik dasturni to'liq yangilashda:", err);
  }

  // 5. Cache-busting parametri bilan to'liq qayta yuklash (hard reload)
  setTimeout(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('_v', now.toString());
      window.location.replace(url.toString());
    } catch {
      window.location.reload();
    }
  }, 500);
}
