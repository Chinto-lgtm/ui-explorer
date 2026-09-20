import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import type { StyleDefinition } from '../../engine/types';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Shuffle, Sparkles, X, Save } from 'lucide-react';
import './StyleMixerModal.css';

export const StyleMixerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { availableStyles, addCustomStyle } = useStyle();

  const [colorSourceId, setColorSourceId] = useState(availableStyles[0].metadata.id);
  const [typoSourceId, setTypoSourceId] = useState(availableStyles[1]?.metadata.id || availableStyles[0].metadata.id);
  const [radiiSourceId, setRadiiSourceId] = useState(availableStyles[2]?.metadata.id || availableStyles[0].metadata.id);
  const [shadowSourceId, setShadowSourceId] = useState(availableStyles[3]?.metadata.id || availableStyles[0].metadata.id);

  const [hybridName, setHybridName] = useState('Hybrid Style');

  const colorSource = availableStyles.find((s) => s.metadata.id === colorSourceId) || availableStyles[0];
  const typoSource = availableStyles.find((s) => s.metadata.id === typoSourceId) || availableStyles[0];
  const radiiSource = availableStyles.find((s) => s.metadata.id === radiiSourceId) || availableStyles[0];
  const shadowSource = availableStyles.find((s) => s.metadata.id === shadowSourceId) || availableStyles[0];

  const hybridStyle: StyleDefinition = {
    metadata: {
      id: `hybrid-${Date.now()}`,
      name: hybridName,
      category: 'Custom',
      description: `Hybrid style mixing colors from ${colorSource.metadata.name}, typography from ${typoSource.metadata.name}, radii from ${radiiSource.metadata.name}.`,
      tags: ['hybrid', 'mixed'],
      personality: 'Experimental hybrid composition',
      bestUsedFor: ['Custom experimental projects'],
      isCustom: true
    },
    tokens: {
      colors: colorSource.tokens.colors,
      typography: typoSource.tokens.typography,
      radii: radiiSource.tokens.radii,
      shadows: shadowSource.tokens.shadows,
      borders: colorSource.tokens.borders,
      motion: colorSource.tokens.motion
    }
  };

  const hybridVars = resolveStyleToCssVars(hybridStyle);

  const handleRandomize = () => {
    const getRandom = () => availableStyles[Math.floor(Math.random() * availableStyles.length)].metadata.id;
    setColorSourceId(getRandom());
    setTypoSourceId(getRandom());
    setRadiiSourceId(getRandom());
    setShadowSourceId(getRandom());
  };

  const handleSave = () => {
    addCustomStyle(hybridStyle);
    onClose();
  };

  return (
    <div className="mixer-modal-backdrop">
      <div className="mixer-modal">
        <div className="mixer-modal-header">
          <div className="mixer-title">
            <Shuffle size={20} />
            <h2>Style Mixer Laboratory</h2>
          </div>
          <button className="mixer-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="mixer-modal-body">
          <div className="mixer-controls-col">
            <Button variant="secondary" icon={<Sparkles size={16} />} onClick={handleRandomize} fullWidth>
              Surprise Me! (Randomize All)
            </Button>

            <div className="mixer-select-group">
              <label>Color Palette Source:</label>
              <select value={colorSourceId} onChange={(e) => setColorSourceId(e.target.value)} className="shell-select">
                {availableStyles.map((s) => (
                  <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>
                ))}
              </select>
            </div>

            <div className="mixer-select-group">
              <label>Typography Source:</label>
              <select value={typoSourceId} onChange={(e) => setTypoSourceId(e.target.value)} className="shell-select">
                {availableStyles.map((s) => (
                  <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>
                ))}
              </select>
            </div>

            <div className="mixer-select-group">
              <label>Corner Radius Source:</label>
              <select value={radiiSourceId} onChange={(e) => setRadiiSourceId(e.target.value)} className="shell-select">
                {availableStyles.map((s) => (
                  <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>
                ))}
              </select>
            </div>

            <div className="mixer-select-group">
              <label>Shadow Elevation Source:</label>
              <select value={shadowSourceId} onChange={(e) => setShadowSourceId(e.target.value)} className="shell-select">
                {availableStyles.map((s) => (
                  <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>
                ))}
              </select>
            </div>

            <Input label="Hybrid Style Name" value={hybridName} onChange={(e) => setHybridName(e.target.value)} />

            <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} fullWidth>
              Save Hybrid Style
            </Button>
          </div>

          <div className="mixer-preview-col" style={hybridVars as React.CSSProperties}>
            <Card hoverable>
              <CardHeader><CardTitle>{hybridName}</CardTitle></CardHeader>
              <CardBody>
                <p>Live preview of your remixed hybrid style definition.</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
