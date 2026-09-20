import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Columns, X } from 'lucide-react';
import './CompareView.css';

export const CompareView: React.FC = () => {
  const { currentStyle, availableStyles, setIsCompareActive } = useStyle();

  const [leftStyleId, setLeftStyleId] = useState(currentStyle.metadata.id);
  const [rightStyleId, setRightStyleId] = useState(() => {
    const diff = availableStyles.find((s) => s.metadata.id !== currentStyle.metadata.id);
    return diff ? diff.metadata.id : currentStyle.metadata.id;
  });

  const leftStyle = availableStyles.find((s) => s.metadata.id === leftStyleId) || currentStyle;
  const rightStyle = availableStyles.find((s) => s.metadata.id === rightStyleId) || currentStyle;

  const leftCssVars = resolveStyleToCssVars(leftStyle);
  const rightCssVars = resolveStyleToCssVars(rightStyle);

  return (
    <div className="compare-view-root">
      <div className="compare-bar">
        <div className="compare-title-row">
          <Columns size={18} />
          <strong>Compare Mode (2-Up Synchronized View)</strong>
        </div>
        <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={() => setIsCompareActive(false)}>
          Exit Compare
        </Button>
      </div>

      <div className="compare-split">
        {/* Left Panel */}
        <div className="compare-panel" style={leftCssVars as React.CSSProperties} {...getStyleDataAttributes(leftStyle)}>
          <div className="compare-panel-header">
            <select value={leftStyleId} onChange={(e) => setLeftStyleId(e.target.value)} className="shell-select">
              {availableStyles.map((s) => (
                <option key={s.metadata.id} value={s.metadata.id}>
                  {s.metadata.name} ({s.metadata.category})
                </option>
              ))}
            </select>
          </div>
          <div className="compare-panel-content">
            <Card hoverable>
              <CardHeader><CardTitle>{leftStyle.metadata.name}</CardTitle></CardHeader>
              <CardBody>
                <p>{leftStyle.metadata.description}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button variant="primary">Action</Button>
                  <Button variant="outline">Details</Button>
                  <Badge variant="accent">Badge</Badge>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Input placeholder="Synchronized input..." />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right Panel */}
        <div className="compare-panel" style={rightCssVars as React.CSSProperties} {...getStyleDataAttributes(rightStyle)}>
          <div className="compare-panel-header">
            <select value={rightStyleId} onChange={(e) => setRightStyleId(e.target.value)} className="shell-select">
              {availableStyles.map((s) => (
                <option key={s.metadata.id} value={s.metadata.id}>
                  {s.metadata.name} ({s.metadata.category})
                </option>
              ))}
            </select>
          </div>
          <div className="compare-panel-content">
            <Card hoverable>
              <CardHeader><CardTitle>{rightStyle.metadata.name}</CardTitle></CardHeader>
              <CardBody>
                <p>{rightStyle.metadata.description}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button variant="primary">Action</Button>
                  <Button variant="outline">Details</Button>
                  <Badge variant="accent">Badge</Badge>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Input placeholder="Synchronized input..." />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
