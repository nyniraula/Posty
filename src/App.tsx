import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBuilder } from './pages/AdminBuilder';
import { PublicFill } from './pages/PublicFill';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/builder" element={<AdminBuilder />} />
      <Route path="/admin/builder/:templateId" element={<AdminBuilder />} />
      <Route path="/fill/:templateId" element={<PublicFill />} />
    </Routes>
  );
}
