import React, { useEffect, useRef } from 'react';
import 'mathlive';
import { MathfieldElement } from 'mathlive';

// Shriftlar va tovushlar birinchi maydon yaratilishidan OLDIN sozlanadi
if (typeof window !== 'undefined') {
  try {
    MathfieldElement.fontsDirectory = 'https://cdn.jsdelivr.net/npm/mathlive/fonts';
    (MathfieldElement as any).soundsDirectory = null;
  } catch (e) {
    console.error('MathLive sozlamasida xatolik:', e);
  }
}

let ce: any = null;

/**
 * Ikki LaTeX javobni matematik jihatdan solishtiradi
 * (masalan \frac{1}{2} va 0.5, 2\sqrt{2} va \sqrt{8} — teng).
 * Wissen Edu'dagi funksiya bilan aynan bir xil.
 */
export async function answersEqual(a: string, b: string): Promise<boolean> {
  if (!a || !b) return false;

  const strA = String(a).replace(/\s/g, '').toLowerCase();
  const strB = String(b).replace(/\s/g, '').toLowerCase();

  if (strA === strB) return true;

  try {
    if (!ce) {
      const { ComputeEngine } = await import('@cortex-js/compute-engine');
      ce = new ComputeEngine();
    }

    const exprA = ce.parse(strA);
    const exprB = ce.parse(strB);

    // 1. Sonli qiymat orqali solishtirish (faqat sonlar bo'lsa)
    const numA = exprA.N().valueOf();
    const numB = exprB.N().valueOf();

    if (typeof numA === 'number' && typeof numB === 'number' && !isNaN(numA) && !isNaN(numB)) {
      if (Math.abs(numA - numB) < 1e-10) return true;
    }

    // 2. Algebraik soddalashtirish orqali solishtirish
    const simA = exprA.simplify();
    const simB = exprB.simplify();
    if (simA.isSame(simB)) return true;
  } catch (e) {
    console.error('Math parsing error:', e);
  }

  return false;
}

export interface MathAnswerFieldProps {
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export const MathAnswerField: React.FC<MathAnswerFieldProps> = ({
  value,
  onChange,
  placeholder = 'Javobni kiriting...',
  readOnly = false,
  className = '',
}) => {
  const mfRef = useRef<any>(null);

  // onChange har renderda yangi funksiya bo'ladi. Uni ref'da saqlaymiz —
  // shunda hodisa tinglovchilari bir marta ulanadi va doim ENG SO'NGGI
  // onChange chaqiriladi (eskirgan holat bilan ishlash xavfi yo'q).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    // 'auto' siyosati orqali MathLive virtual klaviaturani standart va to'g'ri rejimda boshqaradi
    mf.mathVirtualKeyboardPolicy = 'auto';

    const handleInput = () => {
      onChangeRef.current?.(mf.value);
    };

    const handleFocus = (e: Event) => {
      if (readOnlyRef.current) return;

      // Agar aynan virtual klaviatura ochish/yopish tugmasi bosilgan bo'lsa,
      // MathLive o'zining toggle hodisasi orqali uni boshqaradi
      const path = (e.composedPath ? e.composedPath() : []) as HTMLElement[];
      const isToggle = path.some((el: any) =>
        el?.getAttribute?.('part') === 'virtual-keyboard-toggle' ||
        el?.classList?.contains?.('ML__virtual-keyboard-toggle')
      );
      if (isToggle) return;

      // Maydon bosilganda, agar klaviatura ochilmagan bo'lsa ko'rsatamiz
      if (window.mathVirtualKeyboard && !window.mathVirtualKeyboard.visible) {
        window.mathVirtualKeyboard.show({ animate: true });
      }

      // Kichik ekranlarda maydon virtual klaviatura ostida qolib ketmasligi uchun
      setTimeout(() => {
        mf.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    };

    mf.addEventListener('input', handleInput);
    mf.addEventListener('focusin', handleFocus);
    mf.addEventListener('click', handleFocus);

    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('focusin', handleFocus);
      mf.removeEventListener('click', handleFocus);
    };
  }, []);

  // Tashqaridan kelgan qiymatni maydonga sinxronlash
  useEffect(() => {
    const mf = mfRef.current;
    if (mf && mf.value !== (value || '')) {
      mf.value = value || '';
    }
  }, [value]);

  // Faqat o'qish rejimi
  useEffect(() => {
    const mf = mfRef.current;
    if (mf) mf.readOnly = readOnly;
  }, [readOnly]);

  return (
    <math-field
      ref={mfRef}
      style={{
        display: 'block',
        width: '100%',
        minHeight: '44px',
        padding: '8px 12px',
        borderRadius: '12px',
        outline: 'none',
        fontSize: '17px',
      }}
      placeholder={placeholder}
      class={`border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl transition-all ${className}`}
    />
  );
};
