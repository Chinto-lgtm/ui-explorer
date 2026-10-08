import React, { useState } from 'react';
import { HelpCircle, Palette, Snowflake, FileText, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Segmented, Toggle } from '../../../components/ui/Selection';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { Drawer, Popover } from '../../../components/ui/Overlay';
import { useToast } from '../../../components/ui/Feedback';
import { List } from '../../../components/ui/DataDisplay';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Navigation';
import { Carousel } from '../../../components/ui/Content';
import { AppBar } from '../../../components/ui/Mobile';
import { BarChart } from '../../../components/charts/BarChart';
import { DonutChart, ScatterChart } from '../../../components/charts/RadialCharts';
import { AppScreen, SectionTitle } from '../AppLayout';
import { CARDS, CATEGORIES, SCATTER, SPENDING_BY_DAY, SPENDING_BY_MONTH, TRANSACTIONS, USER, money } from '../../content';
import type { Transaction } from '../../content';

const STATEMENTS = ['August 2025', 'July 2025', 'June 2025', 'May 2025', 'April 2025', 'March 2025', 'February 2025', 'January 2025', 'December 2024'];

const COLUMNS: Column<Transaction>[] = [
  { id: 'merchant', header: 'Merchant', cell: (r) => <span><strong>{r.merchant}</strong><br /><span className="tpl-faint oa-small">{r.category} · {r.date}</span></span>, sortValue: (r) => r.merchant },
  { id: 'amount', header: 'Amount', align: 'right', cell: (r) => <span className={`tpl-num ${r.amount > 0 ? 'tpl-positive' : ''}`}>{money(r.amount, true)}</span>, sortValue: (r) => r.amount }
];

export const WalletScreen: React.FC = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState(CARDS);
  const [cardIndex, setCardIndex] = useState(0);
  const [design, setDesign] = useState(false);
  const [frozen, setFrozen] = useState<string[]>([]);
  const [period, setPeriod] = useState('week');
  const [page, setPage] = useState(1);
  const card = cards[cardIndex];
  const statements = STATEMENTS.slice((page - 1) * 3, page * 3);

  return (
    <AppScreen
      bar={(
        <AppBar
          title="Wallet"
          subtitle="3 cards · $11,820.40"
          actions={(
            <Popover align="end" title="About your wallet" trigger={<button type="button" className="oa-icon-btn" aria-label="Wallet help" data-opens="Popover"><HelpCircle size={20} /></button>}>
              Cards are virtual until you order a physical one. Freezing a card blocks new payments instantly.
            </Popover>
          )}
        />
      )}
    >
      <Carousel
        label="Your cards"
        slidesPerView={1.12}
        showArrows={false}
        index={cardIndex}
        onIndexChange={setCardIndex}
        slides={cards.map((c) => (
          <div key={c.id} className="oa-card" style={{ '--card-color': c.color } as React.CSSProperties} data-frozen={frozen.includes(c.id) || undefined}>
            <span className="oa-card__name">{c.name}</span>
            <span className="oa-card__number tpl-num">•••• {c.last4}</span>
            <span className="oa-card__holder">{USER.name}</span>
            {frozen.includes(c.id) && <span className="oa-card__frozen"><Snowflake size={14} /> Frozen</span>}
          </div>
        ))}
      />
      <div className="oa-grid-2">
        <Button variant="secondary" icon={<Palette size={16} />} onClick={() => setDesign(true)} data-opens="Drawer ColorPicker">Design</Button>
        <Button
          variant={frozen.includes(card.id) ? 'primary' : 'secondary'}
          icon={<Snowflake size={16} />}
          onClick={() => {
            const isFrozen = frozen.includes(card.id);
            setFrozen(isFrozen ? frozen.filter((f) => f !== card.id) : [...frozen, card.id]);
            toast({ title: isFrozen ? `${card.name} card unfrozen` : `${card.name} card frozen`, tone: isFrozen ? 'success' : 'info' });
          }}
        >
          {frozen.includes(card.id) ? 'Unfreeze' : 'Freeze'}
        </Button>
      </div>

      <SectionTitle>Spending</SectionTitle>
      <Segmented label="Period" value={period} onChange={setPeriod} options={[{ value: 'week', label: 'Week' }, { value: 'month', label: '6 months' }]} className="oa-full" />
      <Card>
        <CardHeader><CardTitle>{period === 'week' ? 'This week · $405' : 'Last 6 months'}</CardTitle></CardHeader>
        <CardBody><BarChart data={period === 'week' ? SPENDING_BY_DAY : SPENDING_BY_MONTH} height={160} /></CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>By category</CardTitle></CardHeader>
        <CardBody className="oa-center"><DonutChart data={CATEGORIES} size={170} thickness={24} centerLabel="August" /></CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>Purchases by day and size</CardTitle></CardHeader>
        <CardBody><ScatterChart points={SCATTER} height={170} /></CardBody>
      </Card>

      <SectionTitle>Transactions</SectionTitle>
      <DataTable caption="Recent transactions" columns={COLUMNS} rows={TRANSACTIONS} rowKey={(r) => r.id} selectable={false} pageSize={5} searchable={(r) => `${r.merchant} ${r.category}`} className="oa-table" />

      <SectionTitle>Statements</SectionTitle>
      <List
        items={statements.map((s) => ({
          leading: <span className="tpl-icon-chip"><FileText size={18} /></span>,
          title: s,
          description: 'PDF · 3 pages',
          trailing: <Download size={16} />,
          onClick: () => toast({ title: `${s} statement`, description: 'Downloaded to Files.', tone: 'success' })
        }))}
      />
      <div className="oa-center"><Pagination page={page} pageCount={Math.ceil(STATEMENTS.length / 3)} onChange={setPage} /></div>

      <Drawer open={design} onClose={() => setDesign(false)} side="bottom" title={`Design your ${card.name} card`}>
        <div className="tpl-stack">
          <div className="oa-card oa-card--preview" style={{ '--card-color': card.color } as React.CSSProperties}>
            <span className="oa-card__name">{card.name}</span>
            <span className="oa-card__number tpl-num">•••• {card.last4}</span>
            <span className="oa-card__holder">{USER.name}</span>
          </div>
          <ColorPicker label="Card colour" value={card.color} allowAlpha={false} onChange={(color) => setCards(cards.map((c) => (c.id === card.id ? { ...c, color } : c)))} />
          <Toggle checked={card.id !== 'virtual'} onChange={() => toast({ title: 'Physical card', description: 'Order one from the real app.' })} label="Physical card" />
          <div className="tpl-row"><Badge variant="outline" size="sm">Free redesigns</Badge><span className="tpl-faint oa-small">Changes show instantly in Apple Wallet.</span></div>
          <Button fullWidth onClick={() => { setDesign(false); toast({ title: 'Card design saved', tone: 'success' }); }}>Save design</Button>
        </div>
      </Drawer>
    </AppScreen>
  );
};
