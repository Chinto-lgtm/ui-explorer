import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import './ShortcutsPanel.css';

export const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['Ctrl', 'K'], action: 'Search styles, pages, commands and tokens' },
  { keys: ['Ctrl', 'E'], action: 'Open the Customizer' },
  { keys: ['Ctrl', 'Shift', 'C'], action: 'Toggle Compare mode' },
  { keys: ['Ctrl', 'Shift', 'A'], action: 'Toggle Style Anatomy' },
  { keys: ['Ctrl', 'S'], action: 'Save the current custom style' },
  { keys: ['Ctrl', 'Shift', 'E'], action: 'Open Export & Import' },
  { keys: ['Ctrl', 'Z'], action: 'Undo (Customizer)' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo (Customizer)' },
  { keys: ['?'], action: 'Show this panel' },
  { keys: ['Esc'], action: 'Close any panel or dialog' }
];

export const ShortcutsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="shortcuts-backdrop" onClick={onClose}>
      <div className="shortcuts-panel" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="shortcuts-title" id="shortcuts-title">
            <Keyboard size={18} />
            <span>Keyboard shortcuts</span>
          </div>
          <button type="button" className="shortcuts-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <dl className="shortcuts-list">
          {SHORTCUTS.map((s) => (
            <div key={s.action} className="shortcuts-row">
              <dt>
                {s.keys.map((k, i) => (
                  <React.Fragment key={k}>
                    {i > 0 && <span className="shortcuts-plus">+</span>}
                    <kbd>{k}</kbd>
                  </React.Fragment>
                ))}
              </dt>
              <dd>{s.action}</dd>
            </div>
          ))}
        </dl>
        <p className="shortcuts-note">On macOS, Cmd works in place of Ctrl.</p>
      </div>
    </div>
  );
};
