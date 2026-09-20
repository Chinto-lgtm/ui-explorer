import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { Search, Sparkles, Heart, Bell } from 'lucide-react';
import './ComponentsLabPage.css';

export const ComponentsLabPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('buttons');
  const [buttonStateDisabled, setButtonStateDisabled] = useState<boolean>(false);
  const [buttonStateLoading, setButtonStateLoading] = useState<boolean>(false);

  const categories = [
    { id: 'buttons', label: 'Buttons & Controls' },
    { id: 'inputs', label: 'Inputs & Form Elements' },
    { id: 'cards', label: 'Cards & Containers' },
    { id: 'badges', label: 'Badges & Indicators' },
    { id: 'charts', label: 'Data Visualization' }
  ];

  return (
    <div className="components-lab-page">
      <div className="lab-header">
        <h1 className="lab-title">Components Lab</h1>
        <p className="lab-subtitle">
          Interactive design component playground. Test states, focus behavior, and tokens under the active style engine.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="lab-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`lab-tab ${activeCategory === cat.id ? 'lab-tab--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Buttons Showcase */}
      {activeCategory === 'buttons' && (
        <div className="lab-section">
          {/* Controls Bar */}
          <div className="lab-controls-bar">
            <span>Simulate Component State:</span>
            <label className="lab-toggle-label">
              <input
                type="checkbox"
                checked={buttonStateDisabled}
                onChange={(e) => setButtonStateDisabled(e.target.checked)}
              />
              Disabled State
            </label>

            <label className="lab-toggle-label">
              <input
                type="checkbox"
                checked={buttonStateLoading}
                onChange={(e) => setButtonStateLoading(e.target.checked)}
              />
              Loading State
            </label>
          </div>

          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Button Variants</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Button variant="primary" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Primary Button
                </Button>
                <Button variant="secondary" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Secondary Button
                </Button>
                <Button variant="outline" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Outline Button
                </Button>
                <Button variant="ghost" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Ghost Button
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Status & Special Buttons</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Button variant="destructive" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Destructive Action
                </Button>
                <Button variant="success" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Success Action
                </Button>
                <Button variant="floating" icon={<Sparkles size={16} />} disabled={buttonStateDisabled}>
                  Floating Pill
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Button Sizes & Icons</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Button size="sm" icon={<Heart size={14} />}>Small</Button>
                <Button size="md" icon={<Sparkles size={16} />}>Medium</Button>
                <Button size="lg" icon={<Bell size={18} />}>Large</Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Inputs Showcase */}
      {activeCategory === 'inputs' && (
        <div className="lab-section">
          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Standard Input Fields</CardTitle></CardHeader>
              <CardBody className="lab-input-col">
                <Input label="Email Address" placeholder="alex@example.com" helperText="We will never share your email." />
                <Input label="Search Library" placeholder="Type to search..." icon={<Search size={16} />} />
                <Input label="Error State Input" placeholder="Invalid entry" error="Please enter a valid format." />
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Textarea & Complex Inputs</CardTitle></CardHeader>
              <CardBody className="lab-input-col">
                <Textarea label="Project Description" placeholder="Describe your design tokens or style requirements..." />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Cards Showcase */}
      {activeCategory === 'cards' && (
        <div className="lab-section">
          <div className="lab-grid">
            <Card variant="default" hoverable>
              <CardHeader><CardTitle>Default Hoverable Card</CardTitle></CardHeader>
              <CardBody>Standard surface container responding to active token variables.</CardBody>
            </Card>

            <Card variant="outlined">
              <CardHeader><CardTitle>Outlined Card Variant</CardTitle></CardHeader>
              <CardBody>Card with explicit accent border styling.</CardBody>
            </Card>

            <Card variant="elevated">
              <CardHeader><CardTitle>Elevated Shadow Card</CardTitle></CardHeader>
              <CardBody>Card with prominent box-shadow elevation.</CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Badges Showcase */}
      {activeCategory === 'badges' && (
        <div className="lab-section">
          <Card>
            <CardHeader><CardTitle>Badges & Status Tags</CardTitle></CardHeader>
            <CardBody className="lab-component-row">
              <Badge variant="default">Default</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Charts Showcase */}
      {activeCategory === 'charts' && (
        <div className="lab-section">
          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Interactive Line Chart</CardTitle></CardHeader>
              <CardBody>
                <LineChart
                  data={[
                    { label: 'Mon', value: 30 },
                    { label: 'Tue', value: 75 },
                    { label: 'Wed', value: 45 },
                    { label: 'Thu', value: 90 },
                    { label: 'Fri', value: 120 }
                  ]}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Interactive Bar Chart</CardTitle></CardHeader>
              <CardBody>
                <BarChart
                  data={[
                    { label: 'Q1', value: 450 },
                    { label: 'Q2', value: 620 },
                    { label: 'Q3', value: 810 },
                    { label: 'Q4', value: 950 }
                  ]}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
