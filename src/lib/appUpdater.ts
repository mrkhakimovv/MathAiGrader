/**
 * Application Update & Cache Management Utility
 * Dasturni yangilash va keshni boshqarish moduli
 */

const STORAGE_KEY_BUILD_HASH = 'almath_loaded_build_hash';
const STORAGE_KEY_LAST_CHECK = 'almath_last_update_check';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion?: string;
  latestVersion?: string;
  reason?: 'service_worker' | 'build_hash' | 'script_tags' | 'server_start';
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
  } catch (e) {
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
        // Yangi service worker borligini serverdan so'rash
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

      // Kelgan HTML dagi src va href larni qidirish
      const scriptMatches = Array.from(htmlText.matchAll(/src=["'](\/assets\/[^"']+)["']/g)).map(m => m[1]);
      const cssMatches = Array.from(htmlText.matchAll(/href=["'](\/assets\/[^"']+)["']/g)).map(m => m[1]);
      const newAssets = [...scriptMatches, ...cssMatches];

      // Agar serverdagi yangi HTML dagi assetlar hozirgi sahifadagilardan farq qilsa:
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
    message: "Dastur allaqachon eng so'nggi versiyada!",
  };
}

/**
 * Brauzer keshini tozalab, service workerni yangilab,
 * sahifani to'liq yangidan (hard reload) yuklash
 */
export async function applyUpdateAndReload(): Promise<void> {
  try {
    // 1. Service worker waiting postMessage & unregister
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        try {
          await reg.unregister();
        } catch {
          // ignore
        }
      }
    }

    // 2. Barcha CacheStorage keshlarini tozalash
    if (typeof window !== 'undefined' && 'caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }

    // 3. Yangi build hashni sessiyadan o'chirish
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_BUILD_HASH);
    }
  } catch (err) {
    console.error("Xatolik keshni tozalashda:", err);
  }

  // 4. Cache-busting parametri bilan to'liq qayta yuklash
  const url = new URL(window.location.href);
  url.searchParams.set('v', Date.now().toString());
  window.location.href = url.toString();
}
