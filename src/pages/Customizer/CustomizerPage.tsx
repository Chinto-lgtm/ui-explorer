import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { StyleDefinition } from '../../engine/types';
import { Save, RotateCcw, Trash2, Check } from 'lucide-react';
import './CustomizerPage.css';

export const CustomizerPage: React.FC = () => {
  const { currentStyle, addCustomStyle, deleteCustomStyle } = useStyle();

  const [editableStyle, setEditableStyle] = useState<StyleDefinition>(() => JSON.parse(JSON.stringify(currentStyle)));
  const [isSaved, setIsSaved] = useState(false);

  const updateColor = (key: string, val: string) => {
    setEditableStyle((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        colors: {
          ...prev.tokens.colors,
          [key]: val
        }
      }
    }));
    setIsSaved(false);
  };

  const updateTypography = (key: string, val: any) => {
    setEditableStyle((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        typography: {
          ...prev.tokens.typography,
          [key]: val
        }
      }
    }));
    setIsSaved(false);
  };

  const updateRadii = (key: string, val: string) => {
    setEditableStyle((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        radii: {
          ...prev.tokens.radii,
          [key]: val
        }
      }
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const customId = editableStyle.metadata.id.endsWith('-custom')
      ? editableStyle.metadata.id
      : `${editableStyle.metadata.id}-custom-${Date.now().toString().slice(-4)}`;

    const newStyle: StyleDefinition = {
      ...editableStyle,
      metadata: {
        ...editableStyle.metadata,
        id: customId,
        name: editableStyle.metadata.name.includes('(Custom)')
          ? editableStyle.metadata.name
          : `${editableStyle.metadata.name} (Custom)`,
        category: 'Custom',
        isCustom: true
      }
    };

    addCustomStyle(newStyle);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setEditableStyle(JSON.parse(JSON.stringify(currentStyle)));
    setIsSaved(false);
  };

  return (
    <div className="customizer-page">
      <div className="customizer-header">
        <div>
          <h1 className="customizer-title">Style Customizer</h1>
          <p className="customizer-subtitle">
            Tweak tokens, colors, typography, and geometry in real-time. Save as your own custom design style.
          </p>
        </div>
        <div className="customizer-actions">
          <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" icon={isSaved ? <Check size={16} /> : <Save size={16} />} onClick={handleSave}>
            {isSaved ? 'Saved!' : 'Save Custom Style'}
          </Button>
          {editableStyle.metadata.isCustom && (
            <Button
              variant="destructive"
              icon={<Trash2 size={16} />}
              onClick={() => deleteCustomStyle(editableStyle.metadata.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="customizer-grid">
        {/* Controls Column */}
        <div className="customizer-controls">
          {/* Colors Card */}
          <Card>
            <CardHeader><CardTitle>Color Palette Tokens</CardTitle></CardHeader>
            <CardBody className="customizer-field-grid">
              <div className="color-field">
                <label>Background</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={editableStyle.tokens.colors.bg.startsWith('#') ? editableStyle.tokens.colors.bg : '#000000'}
                    onChange={(e) => updateColor('bg', e.target.value)}
                  />
                  <Input value={editableStyle.tokens.colors.bg} onChange={(e) => updateColor('bg', e.target.value)} />
                </div>
              </div>

              <div className="color-field">
                <label>Surface</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={editableStyle.tokens.colors.surface.startsWith('#') ? editableStyle.tokens.colors.surface : '#ffffff'}
                    onChange={(e) => updateColor('surface', e.target.value)}
                  />
                  <Input value={editableStyle.tokens.colors.surface} onChange={(e) => updateColor('surface', e.target.value)} />
                </div>
              </div>

              <div className="color-field">
                <label>Text Primary</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={editableStyle.tokens.colors.textPrimary.startsWith('#') ? editableStyle.tokens.colors.textPrimary : '#111111'}
                    onChange={(e) => updateColor('textPrimary', e.target.value)}
                  />
                  <Input value={editableStyle.tokens.colors.textPrimary} onChange={(e) => updateColor('textPrimary', e.target.value)} />
                </div>
              </div>

              <div className="color-field">
                <label>Accent Color</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={editableStyle.tokens.colors.accent.startsWith('#') ? editableStyle.tokens.colors.accent : '#6366f1'}
                    onChange={(e) => updateColor('accent', e.target.value)}
                  />
                  <Input value={editableStyle.tokens.colors.accent} onChange={(e) => updateColor('accent', e.target.value)} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Typography & Geometry Card */}
          <Card>
            <CardHeader><CardTitle>Typography & Geometry</CardTitle></CardHeader>
            <CardBody className="customizer-field-grid">
              <Input
                label="Sans-Serif Font"
                value={editableStyle.tokens.typography.fontFamilySans}
                onChange={(e) => updateTypography('fontFamilySans', e.target.value)}
              />
              <Input
                label="Base Font Size"
                value={editableStyle.tokens.typography.fontSizeBase}
                onChange={(e) => updateTypography('fontSizeBase', e.target.value)}
              />
              <Input
                label="Border Radius (MD)"
                value={editableStyle.tokens.radii.md}
                onChange={(e) => updateRadii('md', e.target.value)}
              />
              <Input
                label="Border Radius (LG)"
                value={editableStyle.tokens.radii.lg}
                onChange={(e) => updateRadii('lg', e.target.value)}
              />
            </CardBody>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="customizer-preview-panel">
          <Card className="preview-card">
            <CardHeader><CardTitle>Live Component Preview</CardTitle></CardHeader>
            <CardBody className="preview-body">
              <div className="preview-row">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline</Button>
              </div>

              <Input label="Preview Input" placeholder="Type to see live token updates..." />

              <div className="preview-row">
                <span className="badge-preview">Accent Badge</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
