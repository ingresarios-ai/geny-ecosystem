import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EcosystemHub from './pages/EcosystemHub';
import GenyBTracker from './pages/GenyBTracker';

import AppLayout from './components/AppLayout';

import Posicionamiento from './pages/Posicionamiento';
import MiPerfil from './pages/MiPerfil';
import AdminDashboard from './pages/AdminDashboard';
import MigrationWizard from './pages/MigrationWizard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/geny" replace />} />
        <Route path="/actualizacion" element={<MigrationWizard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route element={<AppLayout />}>
          <Route path="/geny" element={<EcosystemHub />} />
          <Route path="/geny/genyb" element={<GenyBTracker />} />
          <Route path="/geny/posicionamiento" element={<Posicionamiento />} />
          <Route path="/geny/perfil" element={<MiPerfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
