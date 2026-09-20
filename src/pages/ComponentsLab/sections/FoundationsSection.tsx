import React from 'react';
import { useStyle } from '../../../hooks/useStyle';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Heart, Bell, Search, Settings, Star, Mail, Zap, Layers } from 'lucide-react';
import type { SectionProps } from './types';

const COLOR_KEYS = [
  ['--color-bg', 'Background'], ['--color-surface', 'Surface'], ['--color-surface-hover', 'Surface hover'],
  ['--color-accent', 'Accent'], ['--color-accent-hover', 'Accent hover'], ['--color-text-primary', 'Text'],
  ['--color-text-secondary', 'Muted'], ['--color-border', 'Border'], ['--color-success', 'Success'],
  ['--color-warning', 'Warning'], ['--color-error', 'Error'], ['--color-info', 'Info']
];

const TYPE_SCALE = ['3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'];
const SPACING = ['0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem', '2rem', '3rem'];
const RADII = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];
const SHADOWS = ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-glow', '--shadow-inset'];

/** Foundations: the raw tokens rendered as swatches, scales and specimens. */
export const FoundationsSection: React.FC<SectionProps> = () => {
  const { resolvedCssVars: v } = useStyle();
  const icons = [Heart, Bell, Search, Settings, Star, Mail, Zap, Layers];
  const stroke = Number(v['--icon-stroke-width']) || 2;

  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
        <CardBody>
          <div className="lab-swatches">
            {COLOR_KEYS.map(([key, label]) => (
              <div key={key} className="lab-swatch">
                <span className="lab-swatch__chip" style={{ background: `var(${key})` }} />
                <span className="lab-swatch__label">{label}</span>
                <code className="lab-swatch__value">{v[key]}</code>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
        <CardBody>
          <p className="lab-type-meta">Heading {v['--font-family-heading'].split(',')[0]} · Body {v['--font-family-sans'].split(',')[0]} · Mono {v['--font-family-mono'].split(',')[0]}</p>
          <p className="lab-type-meta">Weights {v['--font-weight-normal']} / {v['--font-weight-medium']} / {v['--font-weight-bold']} · Tracking {v['--letter-spacing']} · Leading {v['--line-height']}</p>
          <div className="lab-type-scale">
            {TYPE_SCALE.map((s) => (
              <div key={s} className="lab-type-row">
                <code className="lab-type-row__key">{s} · {v[`--font-size-${s}`]}</code>
                <span className="lab-type-row__sample" style={{ fontSize: `var(--font-size-${s})`, fontFamily: s === 'xs' || s === 'sm' ? 'var(--font-family-sans)' : 'var(--font-family-heading)', fontWeight: s === 'base' || s === 'sm' || s === 'xs' ? 'var(--font-weight-normal)' : 'var(--font-weight-bold)' }}>
                  The quick brown fox
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Spacing</CardTitle></CardHeader>
        <CardBody>
          <div className="lab-spacing">
            {SPACING.map((s) => (
              <div key={s} className="lab-spacing__row">
                <code>{s}</code>
                <span className="lab-spacing__bar" style={{ width: s }} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Radius</CardTitle></CardHeader>
        <CardBody>
          <div className="lab-tiles">
            {RADII.map((r) => (
              <div key={r} className="lab-tile">
                <span className="lab-tile__box" style={{ borderRadius: `var(${r})` }} />
                <code>{r.replace('--radius-', '')} · {v[r]}</code>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Shadows &amp; depth</CardTitle></CardHeader>
        <CardBody>
          <div className="lab-tiles">
            {SHADOWS.map((s) => (
              <div key={s} className="lab-tile">
                <span className="lab-tile__box lab-tile__box--surface" style={{ boxShadow: `var(${s})` }} />
                <code>{s.replace('--shadow-', '')}</code>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Borders &amp; surfaces</CardTitle></CardHeader>
        <CardBody>
          <dl className="lab-kv">
            <dt>Border</dt><dd>{v['--border-width']} {v['--border-style']} {v['--border-color']}</dd>
            <dt>Blur</dt><dd>{v['--backdrop-blur']}</dd>
            <dt>Opacity</dt><dd>{v['--material-opacity']}</dd>
            <dt>Gradient</dt><dd>{v['--material-gradient'] === 'none' ? 'none' : 'yes'}</dd>
            <dt>Corner language</dt><dd>{v['--svg-corner-style']}</dd>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Icons</CardTitle></CardHeader>
        <CardBody>
          <div className="lab-icons">
            {icons.map((Icon, i) => <Icon key={i} size={22} strokeWidth={stroke} />)}
          </div>
          <p className="lab-type-meta">Stroke {stroke}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Motion</CardTitle></CardHeader>
        <CardBody>
          <dl className="lab-kv">
            <dt>Fast</dt><dd>{v['--duration-fast']}</dd>
            <dt>Normal</dt><dd>{v['--duration-normal']}</dd>
            <dt>Slow</dt><dd>{v['--duration-slow']}</dd>
            <dt>Easing</dt><dd>{v['--motion-easing']}</dd>
            <dt>Hover / press scale</dt><dd>{v['--hover-scale']} / {v['--active-scale']}</dd>
          </dl>
          <div className="lab-motion-demo" aria-hidden="true"><span className="lab-motion-demo__ball" /></div>
        </CardBody>
      </Card>
    </div>
  );
};
