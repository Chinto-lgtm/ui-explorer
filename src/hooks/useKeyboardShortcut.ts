import { useEffect, useRef } from 'react';

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
  // Kept for call-site compatibility; the callback is read through a ref so it is always current.
  _dependencies: unknown[] = []
) {
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; });
  const { key, ctrlKey, metaKey, altKey, shiftKey } = combo;
  useEffect(() => {
    const combo = { key, ctrlKey, metaKey, altKey, shiftKey };
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchKey = event.key.toLowerCase() === combo.key.toLowerCase();
      const matchCtrl = combo.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
      const matchAlt = combo.altKey ? event.altKey : true;
      const matchShift = combo.shiftKey ? event.shiftKey : true;

      if (matchKey && matchCtrl && matchAlt && matchShift) {
        event.preventDefault();
        callbackRef.current(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlKey, metaKey, altKey, shiftKey]);
}
