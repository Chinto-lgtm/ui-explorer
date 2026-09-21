import React, { useMemo, useRef, useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { validateStyleDefinition, formatValidationErrors, coerceStyleDefinition } from '../../engine/validate';
import { resolveInheritance, type StyleFile } from '../../engine/inherit';
import { exportStyle, exportFilename, EXPORT_FORMATS, type ExportFormat } from '../../engine/exporters';
import type { StyleDefinition } from '../../engine/types';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { Download, Upload, Copy, Check, X, FileJson, AlertTriangle } from 'lucide-react';
import './ExportModal.css';

type Tab = 'export' | 'import';

export const ExportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStyle, availableStyles, addCustomStyle } = useStyle();
  const [tab, setTab] = useState<Tab>('export');
  const [format, setFormat] = useState<ExportFormat>('tokens');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importCandidate, setImportCandidate] = useState<StyleDefinition | null>(null);
  const [importNotes, setImportNotes] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const content = useMemo(() => exportStyle(currentStyle, format), [currentStyle, format]);
  const formatMeta = EXPORT_FORMATS.find((f) => f.id === format)!;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: `${formatMeta.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename(currentStyle, format);
    link.click();
    URL.revokeObjectURL(url);
  };

  /** Parse → validate → resolve inheritance → preview. Nothing is repaired silently. */
  const analyse = (text: string) => {
    setImportText(text);
    setImportCandidate(null);
    setImportError(null);
    setImportNotes([]);
    if (!text.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setImportError(`Invalid JSON.\n${err instanceof Error ? err.message : ''}`);
      return;
    }
    if (typeof parsed !== 'object' || parsed === null) { setImportError('Invalid style.\nExpected a JSON object.'); return; }
    const file = parsed as StyleFile;
    const notes: string[] = [];
    const resolved = resolveInheritance(file, (id) => availableStyles.find((s) => s.metadata.id === id));
    if (file.extends) notes.push(resolved === file ? `Unknown parent "${file.extends}" — nothing inherited.` : `Inherits from "${file.extends}".`);
    const result = validateStyleDefinition(resolved);
    if (!result.ok) { setImportError(formatValidationErrors(result)); return; }
    const style = coerceStyleDefinition(resolved);
    if (!style) { setImportError('Invalid style.'); return; }
    notes.push(...result.warnings);
    if (availableStyles.some((s) => s.metadata.id === style.metadata.id)) notes.push(`A style with id "${style.metadata.id}" already exists and will be replaced.`);
    setImportNotes(notes);
    setImportCandidate({ ...style, metadata: { ...style.metadata, isCustom: true, source: style.metadata.source === 'community' ? 'community' : 'custom' } });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(analyse).catch(() => setImportError('Could not read the file.'));
  };

  const handleImport = () => {
    if (!importCandidate) return;
    addCustomStyle(importCandidate);
    onClose();
  };

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="export-modal" role="dialog" aria-modal="true" aria-label="Export and import" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <div className="export-title">
            <Download size={20} />
            <h2>Export & Import</h2>
          </div>
          <button className="export-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="export-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'export'} className={`export-tab ${tab === 'export' ? 'export-tab--active' : ''}`} onClick={() => setTab('export')}>Export {currentStyle.metadata.name}</button>
          <button role="tab" aria-selected={tab === 'import'} className={`export-tab ${tab === 'import' ? 'export-tab--active' : ''}`} onClick={() => setTab('import')}>Import a style</button>
        </div>

        <div className="export-modal-body">
          {tab === 'export' && (
            <div className="export-tab-content">
              <div className="export-formats" role="group" aria-label="Export format">
                {EXPORT_FORMATS.map((f) => (
                  <button key={f.id} type="button" className={`export-format ${format === f.id ? 'export-format--active' : ''}`} aria-pressed={format === f.id} onClick={() => setFormat(f.id)} title={f.hint}>
                    <span className="export-format__label">{f.label}</span>
                    <span className="export-format__ext">.{f.ext}</span>
                  </button>
                ))}
              </div>
              <p className="export-hint">{formatMeta.hint}. Output is deterministic — the same style always exports identically.</p>
              {format === 'svg' ? (
                <div className="export-svg-preview">
                  <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`} alt={`${currentStyle.metadata.name} preview`} />
                </div>
              ) : (
                <Textarea value={content} readOnly rows={12} className="code-textarea" aria-label={`${formatMeta.label} output`} />
              )}
              <div className="export-actions-row">
                <Button variant="secondary" icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</Button>
                <Button variant="primary" icon={<Download size={16} />} onClick={handleDownload}>Download {exportFilename(currentStyle, format)}</Button>
              </div>
            </div>
          )}

          {tab === 'import' && (
            <div className="export-tab-content">
              <div className="import-source">
                <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
                <Button variant="secondary" icon={<FileJson size={16} />} onClick={() => fileRef.current?.click()}>Choose a .json file</Button>
                <span className="export-hint">or paste a style package below. Files may use <code>extends</code>; parents resolve against the registered styles.</span>
              </div>
              <Textarea
                placeholder='{ "metadata": { ... }, "tokens": { ... } }'
                value={importText}
                onChange={(e) => analyse(e.target.value)}
                rows={8}
                className="code-textarea"
                aria-label="Style JSON"
              />
              {importError && <pre className="import-error-msg" role="alert"><AlertTriangle size={14} /> {importError}</pre>}
              {importCandidate && (
                <div className="import-preview">
                  <StylePreviewCard style={importCandidate} size="thumb" />
                  <div className="import-preview__meta">
                    <strong>{importCandidate.metadata.name}</strong>
                    <span>{importCandidate.metadata.category} · {importCandidate.metadata.id}</span>
                    {importNotes.map((n) => <span key={n} className="import-note">{n}</span>)}
                  </div>
                </div>
              )}
              <Button variant="primary" icon={<Upload size={16} />} onClick={handleImport} disabled={!importCandidate} fullWidth>
                {importCandidate ? `Add “${importCandidate.metadata.name}” to my styles` : 'Import style'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
