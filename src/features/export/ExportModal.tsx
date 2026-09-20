import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Download, Upload, Copy, Check, X } from 'lucide-react';
import './ExportModal.css';

export const ExportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStyle, addCustomStyle } = useStyle();
  const [activeTab, setActiveTab] = useState<'export-json' | 'export-css' | 'import'>('export-json');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const resolvedVars = resolveStyleToCssVars(currentStyle);

  const jsonContent = JSON.stringify(currentStyle, null, 2);

  const cssContent = `:root {\n${Object.entries(resolvedVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.metadata || !parsed.tokens) {
        throw new Error('Invalid style schema. Must include metadata and tokens.');
      }
      addCustomStyle(parsed);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON.');
    }
  };

  return (
    <div className="export-modal-backdrop">
      <div className="export-modal">
        <div className="export-modal-header">
          <div className="export-title">
            <Download size={20} />
            <h2>Export & Import System</h2>
          </div>
          <button className="export-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="export-tabs">
          <button
            className={`export-tab ${activeTab === 'export-json' ? 'export-tab--active' : ''}`}
            onClick={() => setActiveTab('export-json')}
          >
            Export JSON Tokens
          </button>
          <button
            className={`export-tab ${activeTab === 'export-css' ? 'export-tab--active' : ''}`}
            onClick={() => setActiveTab('export-css')}
          >
            Export Theme CSS
          </button>
          <button
            className={`export-tab ${activeTab === 'import' ? 'export-tab--active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            Import Custom JSON
          </button>
        </div>

        <div className="export-modal-body">
          {activeTab === 'export-json' && (
            <div className="export-tab-content">
              <Textarea value={jsonContent} readOnly rows={12} className="code-textarea" />
              <div className="export-actions-row">
                <Button variant="secondary" icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={() => handleCopy(jsonContent)}>
                  {copied ? 'Copied JSON!' : 'Copy JSON'}
                </Button>
                <Button variant="primary" icon={<Download size={16} />} onClick={() => handleDownload(jsonContent, `${currentStyle.metadata.id}.json`)}>
                  Download JSON
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'export-css' && (
            <div className="export-tab-content">
              <Textarea value={cssContent} readOnly rows={12} className="code-textarea" />
              <div className="export-actions-row">
                <Button variant="secondary" icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={() => handleCopy(cssContent)}>
                  {copied ? 'Copied CSS!' : 'Copy CSS'}
                </Button>
                <Button variant="primary" icon={<Download size={16} />} onClick={() => handleDownload(cssContent, `${currentStyle.metadata.id}.css`)}>
                  Download CSS
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="export-tab-content">
              <Textarea
                placeholder="Paste valid StyleDefinition JSON here..."
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError(null);
                }}
                rows={10}
                className="code-textarea"
              />
              {importError && <p className="import-error-msg">{importError}</p>}
              <Button variant="primary" icon={<Upload size={16} />} onClick={handleImport} fullWidth>
                Import Style Definition
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
