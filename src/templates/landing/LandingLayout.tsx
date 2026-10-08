import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, ArrowRight, Sparkles, Mail } from 'lucide-react';
import { Navbar, SideNav } from '../../components/ui/Navigation';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Overlay';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Feedback';
import { useTemplateNav } from '../nav';
import { Logo } from '../shared/Logo';
import { BRAND, SITE_NAV } from '../content';
import { LandingViewport, NARROW_WIDTH } from './viewport';
import './landing.css';


const FOOTER_COLUMNS = [
  { title: 'Product', links: [{ id: 'features', label: 'Features' }, { id: 'pricing', label: 'Pricing' }, { id: 'signin', label: 'Sign in' }] },
  { title: 'Company', links: [{ id: 'about', label: 'About' }, { id: 'blog', label: 'Blog' }, { id: 'about', label: 'Careers' }] },
  { title: 'Support', links: [{ id: 'contact', label: 'Contact' }, { id: 'pricing', label: 'FAQ' }, { id: 'contact', label: 'Book a demo' }] }
];

const Footer: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  return (
    <footer className="ls-footer">
      <div className="ls-container ls-footer__grid">
        <div className="ls-footer__brand">
          <Logo />
          <p className="tpl-muted">{BRAND.tagline}. Built for calm, not for clicks.</p>
          <form className="ls-footer__news" onSubmit={(e) => { e.preventDefault(); toast({ tone: 'success', title: 'You are on the list', description: email ? `Monthly notes go to ${email}.` : 'One calm email a month.' }); setEmail(''); }}>
            <Input aria-label="Email for the newsletter" type="email" placeholder="you@example.com" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" variant="secondary">Subscribe</Button>
          </form>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} className="ls-footer__col" aria-label={col.title}>
            <span className="ls-footer__title">{col.title}</span>
            {col.links.map((l) => (
              <button key={l.label} type="button" className="ls-footer__link" onClick={() => go(l.id)}>{l.label}</button>
            ))}
          </nav>
        ))}
      </div>
      <div className="ls-container ls-footer__legal">
        <span>© 2025 Orbit Financial Ltd. A fictional company for demonstration.</span>
        <span className="ls-footer__legal-links"><span>Privacy</span><span>Terms</span><span>Cookies</span></span>
      </div>
    </footer>
  );
};

export const LandingLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { screen, go, family } = useTemplateNav();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(family === 'landing-mobile');
  const [menu, setMenu] = useState(false);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setNarrow(el.clientWidth < NARROW_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A new page starts at the top, like a real navigation.
  useEffect(() => { scrollRef.current?.scrollTo?.({ top: 0 }); }, [screen]);

  const navigate = (id: string) => { setMenu(false); go(id); };

  return (
    <LandingViewport.Provider value={{ narrow }}>
      <div className={`ls tpl-scroll ${narrow ? 'ls--narrow' : ''}`} ref={scrollRef}>
        <button type="button" className="ls-announce" onClick={() => navigate('features')}>
          <Sparkles size={14} aria-hidden="true" />
          <span><strong>New:</strong> shared wallets for households and flatmates</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
        <header className="ls-header">
          <div className="ls-container">
            <Navbar
              className="ls-navbar"
              brand={<button type="button" className="ls-brand" onClick={() => navigate('home')} aria-label={`${BRAND.name} home`}><Logo /></button>}
              items={SITE_NAV}
              active={screen}
              onSelect={navigate}
              actions={narrow ? (
                <>
                  <Button size="sm" onClick={() => navigate('signin')}>Get started</Button>
                  <Button variant="ghost" size="sm" iconOnly aria-label="Open menu" icon={<Menu size={20} />} onClick={() => setMenu(true)} data-opens="Drawer SideNav" />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('signin')}>Sign in</Button>
                  <Button size="sm" icon={<ArrowRight size={14} />} iconPosition="right" onClick={() => navigate('signin')}>Get started</Button>
                </>
              )}
            />
          </div>
        </header>
        <main className="ls-main">{children}</main>
        <Footer />
      </div>
      <Drawer open={menu} onClose={() => setMenu(false)} side="left" title={<Logo />} className="ls-menu">
        <div className="tpl-stack">
          <SideNav heading="Menu" items={SITE_NAV} active={screen} onSelect={navigate} />
          <Button fullWidth onClick={() => navigate('signin')}>Get started free</Button>
          <Button fullWidth variant="secondary" onClick={() => navigate('signin')}>Sign in</Button>
        </div>
      </Drawer>
    </LandingViewport.Provider>
  );
};
