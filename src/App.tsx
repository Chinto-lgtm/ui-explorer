import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StyleProvider } from './engine/context';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { WelcomePage } from './pages/Welcome/WelcomePage';
import { hasCompletedOnboarding } from './config/app';

// Tool pages are code-split so the first paint only carries the shell, the engine and the dashboard.
const GeneratorPage = lazy(() => import('./pages/Generator/GeneratorPage').then((m) => ({ default: m.GeneratorPage })));
const ComponentsLabPage = lazy(() => import('./pages/ComponentsLab/ComponentsLabPage').then((m) => ({ default: m.ComponentsLabPage })));
const LabsPage = lazy(() => import('./pages/Labs/LabsPage').then((m) => ({ default: m.LabsPage })));
const CustomizerPage = lazy(() => import('./pages/Customizer/CustomizerPage').then((m) => ({ default: m.CustomizerPage })));
const StylesPage = lazy(() => import('./pages/Styles/StylesPage').then((m) => ({ default: m.StylesPage })));

const PageFallback: React.FC = () => (
  <div className="page-loading" role="status" aria-live="polite">Loading…</div>
);

/** Pages that live inside the app shell (header, sidebar, themed canvas). */
const ShellRoutes: React.FC = () => (
  <AppShell>
    <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/" element={hasCompletedOnboarding() ? <DashboardPage /> : <Navigate to="/welcome" replace />} />
      <Route path="/styles" element={<StylesPage />} />
      <Route path="/generator" element={<GeneratorPage />} />
      <Route path="/components" element={<ComponentsLabPage />} />
      <Route path="/data" element={<LabsPage />} />
      <Route path="/labs" element={<LabsPage />} />
      <Route path="/customizer" element={<CustomizerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  </AppShell>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <StyleProvider>
          <Routes>
            {/* The welcome view is full-bleed and renders outside the shell. */}
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/*" element={<ShellRoutes />} />
          </Routes>
        </StyleProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
