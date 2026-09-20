import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: (e: KeyboardEvent) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchKey = event.key.toLowerCase() === combo.key.toLowerCase();
      const matchCtrl = combo.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
      const matchAlt = combo.altKey ? event.altKey : true;
      const matchShift = combo.shiftKey ? event.shiftKey : true;

      if (matchKey && matchCtrl && matchAlt && matchShift) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combo.key, combo.ctrlKey, combo.metaKey, combo.altKey, combo.shiftKey, ...dependencies]);
}
