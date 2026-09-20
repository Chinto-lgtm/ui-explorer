import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StyleProvider } from './engine/context';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { GeneratorPage } from './pages/Generator/GeneratorPage';
import { ComponentsLabPage } from './pages/ComponentsLab/ComponentsLabPage';
import { DataInteractionPage } from './pages/DataInteraction/DataInteractionPage';
import { CustomizerPage } from './pages/Customizer/CustomizerPage';
import { WelcomePage } from './pages/Welcome/WelcomePage';
import { hasCompletedOnboarding } from './config/app';

/** Pages that live inside the app shell (header, sidebar, themed canvas). */
const ShellRoutes: React.FC = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={hasCompletedOnboarding() ? <DashboardPage /> : <Navigate to="/welcome" replace />} />
      <Route path="/generator" element={<GeneratorPage />} />
      <Route path="/components" element={<ComponentsLabPage />} />
      <Route path="/data" element={<DataInteractionPage />} />
      <Route path="/customizer" element={<CustomizerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppShell>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StyleProvider>
        <Routes>
          {/* The welcome view is full-bleed and renders outside the shell. */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/*" element={<ShellRoutes />} />
        </Routes>
      </StyleProvider>
    </BrowserRouter>
  );
};

export default App;
