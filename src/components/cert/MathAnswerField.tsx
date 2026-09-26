import React, { useEffect, useRef } from 'react';
import 'mathlive';
import { MathfieldElement } from 'mathlive';

if (typeof window !== 'undefined') {
  try {
    MathfieldElement.fontsDirectory = 'https://cdn.jsdelivr.net/npm/mathlive/fonts';
    (MathfieldElement as any).soundsDirectory = null;
  } catch (e) {
    console.error("Error setting MathfieldElement config:", e);
  }
}

let ce: any = null;

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

    // 1. Numerik qiymat orqali solishtirish (faqat sonlar bo'lsa)
    const numA = exprA.N().valueOf();
    const numB = exprB.N().valueOf();
    
    if (typeof numA === 'number' && typeof numB === 'number' && !isNaN(numA) && !isNaN(numB)) {
      if (Math.abs(numA - numB) < 1e-10) return true;
    }

    // 2. Algebraik soddalashtirish orqali solishtirish
    const simA = exprA.simplify();
    const simB = exprB.simplify();
    if (simA.isSame(simB)) return true;

  } catch(e) {
    console.error("Math parsing error:", e);
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
  placeholder = "Javobni kiriting...",
  readOnly = false,
  className = ""
}) => {
  const mfRef = useRef<any>(null);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    mf.mathVirtualKeyboardPolicy = 'manual';

    const handleInput = () => {
      if (onChange) {
        onChange(mf.value);
      }
    };

    const handleFocus = () => {
      if (!readOnly && typeof window !== 'undefined' && window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.show();
      }
    };

    const handleBlur = () => {
      if (typeof window !== 'undefined' && window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.hide();
      }
    };

    mf.addEventListener('input', handleInput);
    mf.addEventListener('focus', handleFocus);
    mf.addEventListener('blur', handleBlur);

    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('focus', handleFocus);
      mf.removeEventListener('blur', handleBlur);
    };
  }, [onChange, readOnly]);

  useEffect(() => {
    if (mfRef.current && mfRef.current.value !== (value || '')) {
      mfRef.current.value = value || '';
    }
  }, [value]);

  return (
    <math-field
      ref={mfRef}
      style={{
        display: 'block',
        minHeight: '44px',
        padding: '8px 12px',
        borderRadius: '12px',
        outline: 'none',
        fontSize: '15px'
      }}
      readonly={readOnly ? true : undefined}
      placeholder={placeholder}
      class={`border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl transition-all ${className}`}
    />
  );
};
