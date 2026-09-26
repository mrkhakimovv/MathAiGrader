declare namespace JSX {
  interface IntrinsicElements {
    'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      value?: string;
      readonly?: boolean;
      disabled?: boolean;
      placeholder?: string;
      [key: string]: any;
    };
  }
}

declare interface Window {
  mathVirtualKeyboard?: {
    show: () => void;
    hide: () => void;
    visible: boolean;
    [key: string]: any;
  };
}
