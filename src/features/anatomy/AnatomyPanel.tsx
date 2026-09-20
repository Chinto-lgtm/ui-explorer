import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { X, Copy, Check, Sliders } from 'lucide-react';
import './AnatomyPanel.css';

export const AnatomyPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStyle, resolvedCssVars } = useStyle();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(`${key}: ${val};`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <aside className="anatomy-panel">
      <div className="anatomy-header">
        <div className="anatomy-title-row">
          <Sliders size={18} />
          <h3>Style Anatomy Inspector</h3>
        </div>
        <button className="anatomy-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="anatomy-style-info">
        <h4>{currentStyle.metadata.name}</h4>
        <span className="anatomy-badge">{currentStyle.metadata.category}</span>
        <p>{currentStyle.metadata.description}</p>
      </div>

      <div className="anatomy-sections">
        <div className="anatomy-section">
          <span className="anatomy-section-title">Resolved CSS Custom Properties</span>
          <div className="anatomy-token-list">
            {Object.entries(resolvedCssVars).map(([key, val]) => (
              <div key={key} className="anatomy-token-row" onClick={() => handleCopy(key, val)}>
                <div className="token-meta">
                  <span className="token-key">{key}</span>
                  <span className="token-val">{val}</span>
                </div>
                {key.startsWith('--color') && (
                  <span className="color-swatch-preview" style={{ backgroundColor: val }} />
                )}
                <button className="token-copy-btn">
                  {copiedKey === key ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
