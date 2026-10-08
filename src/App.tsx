import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { StyleProvider } from './engine/context';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { NotFound } from './components/layout/NotFound';
import { LandingPage } from './pages/Landing/LandingPage';
import { BASE_PATH } from './config/app';
import { PAGES } from './config/routes';

// Tool pages are code-split so the first paint only carries the landing page, the shell and the engine.
const PAGE_COMPONENTS = Object.fromEntries(PAGES.map((p) => [p.id, lazy(p.load)]));
const TemplatePreviewPage = lazy(() => import('./pages/Templates/TemplatePreviewPage').then((m) => ({ default: m.TemplatePreviewPage })));

const PageFallback: React.FC = () => (
  <div className="page-loading" role="status" aria-live="polite">Loading…</div>
);

/** Old addresses keep working: /data and /labs?lab=x now live under /components/x. */
const LabsRedirect: React.FC = () => {
  const [params] = useSearchParams();
  const { lab } = useParams();
  return <Navigate to={`/components/${lab ?? params.get('lab') ?? 'table'}`} replace />;
};

/** The old welcome address now points at the landing page, keeping any query. */
const WelcomeRedirect: React.FC = () => {
  const { search } = useLocation();
  return <Navigate to={`/${search}`} replace />;
};

/** Pages that live inside the app shell (header, sidebar, themed canvas). */
const ShellRoutes: React.FC = () => (
  <AppShell>
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {PAGES.map((p) => {
          const Page = PAGE_COMPONENTS[p.id];
          return <Route key={p.id} path={p.pattern} element={<Page />} />;
        })}
        <Route path="/data" element={<LabsRedirect />} />
        <Route path="/labs/:lab?" element={<LabsRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </AppShell>
);

export const App: React.FC = () => (
  <ErrorBoundary>
    <BrowserRouter basename={BASE_PATH || undefined}>
      <StyleProvider>
        <Routes>
          {/* The landing page and the full-screen template preview render without the shell. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomeRedirect />} />
          <Route path="/preview/:family/:screen" element={<Suspense fallback={<PageFallback />}><TemplatePreviewPage /></Suspense>} />
          <Route path="/*" element={<ShellRoutes />} />
        </Routes>
      </StyleProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
