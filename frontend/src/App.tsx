import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './routes/index';
import NewAnalysis from './routes/new-analysis';
import Results from './routes/results';
import ClinicalReport from './routes/report';
import Settings from './routes/settings';
import ModelTab from './routes/model';
import PatientHistory from './routes/history';
import Login from './routes/login';
import { isAuthenticated } from './services/authService';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell>{children}</AppShell>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/new-analysis" element={<ProtectedLayout><NewAnalysis /></ProtectedLayout>} />
        <Route path="/results" element={<ProtectedLayout><Results /></ProtectedLayout>} />
        <Route path="/report" element={<ProtectedLayout><ClinicalReport /></ProtectedLayout>} />
        <Route path="/history" element={<ProtectedLayout><PatientHistory /></ProtectedLayout>} />
        <Route path="/model" element={<ProtectedLayout><ModelTab /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
