import React from 'react';
import { useStyle } from '../../hooks/useStyle';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { mockDashboardKpis, mockRevenueData, mockActivityData, mockRecentActivities } from '../../data/mockData';
import { ArrowUpRight, ArrowDownRight, Sparkles, Sliders, CheckCircle2, Clock } from 'lucide-react';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { currentStyle } = useStyle();
  const { metadata } = currentStyle;

  return (
    <div className="dashboard-page">
      {/* Hero Showcase */}
      <section className="dashboard-hero">
        <div className="dashboard-hero__header">
          <Badge variant="accent" size="md">{metadata.category}</Badge>
          <h1 className="dashboard-hero__title">{metadata.name}</h1>
          <p className="dashboard-hero__description">{metadata.description}</p>
        </div>

        <div className="dashboard-hero__meta">
          <div className="dashboard-hero__meta-item">
            <span className="dashboard-hero__meta-label">Personality</span>
            <span className="dashboard-hero__meta-value">{metadata.personality}</span>
          </div>

          <div className="dashboard-hero__meta-item">
            <span className="dashboard-hero__meta-label">Best Used For</span>
            <div className="dashboard-hero__tags">
              {metadata.bestUsedFor.map((item, i) => (
                <Badge key={i} variant="outline" size="sm">{item}</Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="dashboard-grid dashboard-grid--kpis">
        {mockDashboardKpis.map((kpi) => (
          <Card key={kpi.id} hoverable variant="default">
            <div className="kpi-card__header">
              <span className="kpi-card__title">{kpi.title}</span>
              <span className={`kpi-card__change ${kpi.isPositive ? 'kpi-card__change--positive' : 'kpi-card__change--negative'}`}>
                {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </span>
            </div>
            <div className="kpi-card__value">{kpi.value}</div>
            <div className="kpi-card__sparkline">
              <LineChart
                data={kpi.sparkline.map((val, idx) => ({ label: `P${idx}`, value: val }))}
                height={50}
                showPoints={false}
                gradient={false}
              />
            </div>
          </Card>
        ))}
      </section>

      {/* Main Charts & Activity Row */}
      <section className="dashboard-grid dashboard-grid--main">
        {/* Revenue Chart */}
        <Card className="dashboard-chart-card">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <Button variant="outline" size="sm">Monthly</Button>
          </CardHeader>
          <CardBody>
            <LineChart data={mockRevenueData} height={220} />
          </CardBody>
        </Card>

        {/* Weekly Activity */}
        <Card className="dashboard-chart-card">
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <Button variant="ghost" size="sm">Export</Button>
          </CardHeader>
          <CardBody>
            <BarChart data={mockActivityData} height={220} />
          </CardBody>
        </Card>
      </section>

      {/* Activity Feed & Quick Actions */}
      <section className="dashboard-grid dashboard-grid--sub">
        <Card>
          <CardHeader>
            <CardTitle>Recent Style Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="activity-list">
              {mockRecentActivities.map((act) => (
                <li key={act.id} className="activity-item">
                  <div className="activity-item__icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="activity-item__content">
                    <span className="activity-item__user">{act.user}</span>
                    <span className="activity-item__action">{act.action}</span>
                    <strong className="activity-item__target">{act.target}</strong>
                  </div>
                  <span className="activity-item__time">
                    <Clock size={12} /> {act.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Style Actions</CardTitle>
          </CardHeader>
          <CardBody className="quick-actions-body">
            <p>Experiment with components, inspect design tokens, or remix styles live.</p>
            <div className="quick-actions-btns">
              <Button variant="primary" icon={<Sparkles size={16} />}>Explore Components</Button>
              <Button variant="secondary" icon={<Sliders size={16} />}>Customize Tokens</Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};
