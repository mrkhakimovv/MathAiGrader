/**
 * MathLive'ning <math-field> veb-komponenti uchun JSX tiplari.
 * React 19 da JSX tiplari `React.JSX` nomlar fazosida turadi, shuning uchun
 * global `JSX` emas, 'react' modulini kengaytiramiz.
 */
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        'read-only'?: boolean | string;
        disabled?: boolean;
        placeholder?: string;
        class?: string;
        [key: string]: any;
      };
    }
  }
}

declare global {
  interface Window {
    mathVirtualKeyboard?: {
      show: () => void;
      hide: () => void;
      visible: boolean;
      [key: string]: any;
    };
  }
}

export {};
