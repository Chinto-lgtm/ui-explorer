import React, { useEffect, useRef, useState } from 'react';
import { Search, SquarePen, Phone, Play, Pause, SendHorizontal, Paperclip, Copy, Reply, Trash2, Smile } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar, List } from '../../../components/ui/DataDisplay';
import { ContextMenu } from '../../../components/ui/Overlay';
import { useToast } from '../../../components/ui/Feedback';
import { Chip } from '../../../components/ui/Content';
import { AppBar, ChatBubble } from '../../../components/ui/Mobile';
import { Waveform } from '../../../components/charts/RadialCharts';
import { useTemplateNav } from '../../nav';
import { AppScreen } from '../AppLayout';
import { CHATS, WAVE } from '../../content';

export const MessagesScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const shown = CHATS.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <AppScreen
      bar={<AppBar variant="large" title="Chats" actions={<button type="button" className="oa-icon-btn" aria-label="New chat" onClick={() => toast({ title: 'New chat', description: 'Pick a contact in the real app.' })}><SquarePen size={20} /></button>} />}
    >
      <Input aria-label="Search chats" placeholder="Search" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
      <List
        dividers
        items={shown.map((c) => ({
          leading: <Avatar name={c.name} size="lg" status={c.online ? 'online' : undefined} />,
          title: <span className="tpl-row tpl-row--between"><span>{c.name}</span><span className="tpl-faint oa-small">{c.time}</span></span>,
          description: <span className="tpl-row tpl-row--between"><span className="oa-ellipsis">{c.last}</span>{c.unread > 0 && <Badge size="sm" variant="accent">{c.unread}</Badge>}</span>,
          onClick: () => go('chat')
        }))}
      />
    </AppScreen>
  );
};

interface Message { id: number; from: 'me' | 'them'; text?: string; voice?: boolean; time: string }

const START: Message[] = [
  { id: 1, from: 'them', text: 'Hi Sam! I’m Diego from Orbit Support 👋', time: '09:38' },
  { id: 2, from: 'them', text: 'Your replacement card shipped this morning. It should arrive Monday.', time: '09:38' },
  { id: 3, from: 'me', text: 'Amazing, thanks! Can I still use the virtual one until then?', time: '09:40' },
  { id: 4, from: 'them', voice: true, time: '09:41' },
  { id: 5, from: 'them', text: 'Yes — it already works in Apple Pay and online.', time: '09:41' }
];

const QUICK = ['Thanks!', 'Track my card', 'Talk to a person'];

export const ChatScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [messages, setMessages] = useState(START);
  const [draft, setDraft] = useState('');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.3);
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view. Only the chat body scrolls, never the page around the device.
  useEffect(() => {
    const body = endRef.current?.parentElement;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages]);

  // The voice note plays for real: the waveform fills while it "plays".
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setProgress((p) => {
      if (p >= 1) { setPlaying(false); return 0; }
      return Math.min(1, p + 0.05);
    }), 200);
    return () => window.clearInterval(id);
  }, [playing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const now = '09:4' + Math.min(9, messages.length);
    setMessages((m) => [...m, { id: Date.now(), from: 'me', text, time: now }]);
    setDraft('');
    window.setTimeout(() => setMessages((m) => [...m, { id: Date.now() + 1, from: 'them', text: 'Got it — anything else I can help with?', time: now }]), 1200);
  };

  const menu = (m: Message) => [
    { id: 'reply', label: 'Reply', icon: <Reply size={14} />, onSelect: () => setDraft(`“${m.text ?? 'Voice message'}” — `) },
    { id: 'copy', label: 'Copy', icon: <Copy size={14} />, onSelect: () => toast({ title: 'Copied' }) },
    { id: 'react', label: 'React', icon: <Smile size={14} />, onSelect: () => toast({ title: 'Reacted with ❤️' }) },
    'separator' as const,
    { id: 'delete', label: 'Delete for me', icon: <Trash2 size={14} />, danger: true, onSelect: () => setMessages((all) => all.filter((x) => x.id !== m.id)) }
  ];

  return (
    <AppScreen
      bar={(
        <AppBar
          title="Orbit Support"
          subtitle="Diego · usually replies in 3 min"
          onBack={() => go('messages')}
          actions={<button type="button" className="oa-icon-btn" aria-label="Call support" onClick={() => toast({ title: 'Calling Orbit Support…' })}><Phone size={18} /></button>}
        />
      )}
      footer={(
        <div className="tpl-stack tpl-stack--tight">
          <div className="oa-quick">
            {QUICK.map((q) => <Chip key={q} size="sm" onClick={() => send(q)}>{q}</Chip>)}
          </div>
          <form className="oa-composer" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <button type="button" className="oa-icon-btn" aria-label="Attach" onClick={() => toast({ title: 'Attach a photo or file' })}><Paperclip size={18} /></button>
            <Input aria-label="Message" placeholder="Message" value={draft} onChange={(e) => setDraft(e.target.value)} className="tpl-grow" />
            <button type="submit" className="oa-send" aria-label="Send" disabled={!draft.trim()}><SendHorizontal size={18} /></button>
          </form>
        </div>
      )}
      className="oa-chat"
    >
      <span className="oa-day">Today</span>
      {messages.map((m, i) => {
        const grouped = i > 0 && messages[i - 1].from === m.from;
        return (
          <ContextMenu key={m.id} items={menu(m)} className="oa-chat__row">
            <ChatBubble from={m.from} author={m.from === 'them' ? 'Diego Alvarez' : undefined} grouped={grouped} time={m.time} status={m.from === 'me' ? (i === messages.length - 1 ? 'delivered' : 'read') : undefined}>
              {m.voice ? (
                <span className="oa-voice">
                  <button type="button" className="oa-voice__btn" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause voice message' : 'Play voice message'}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
                  <span className="tpl-grow"><Waveform samples={WAVE} height={28} progress={progress} animate={false} /></span>
                  <span className="tpl-num">0:{String(Math.round(14 * progress)).padStart(2, '0')}</span>
                </span>
              ) : m.text}
            </ChatBubble>
          </ContextMenu>
        );
      })}
      <div ref={endRef} />
      <span className="oa-day oa-hint">Long-press or right-click a message for options</span>
    </AppScreen>
  );
};
