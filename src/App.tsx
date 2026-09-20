import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StyleProvider } from './engine/context';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { GeneratorPage } from './pages/Generator/GeneratorPage';
import { ComponentsLabPage } from './pages/ComponentsLab/ComponentsLabPage';
import { DataInteractionPage } from './pages/DataInteraction/DataInteractionPage';
import { CustomizerPage } from './pages/Customizer/CustomizerPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StyleProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/components" element={<ComponentsLabPage />} />
            <Route path="/data" element={<DataInteractionPage />} />
            <Route path="/customizer" element={<CustomizerPage />} />
          </Routes>
        </AppShell>
      </StyleProvider>
    </BrowserRouter>
  );
};

export default App;
