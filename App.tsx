import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import News from './pages/public/News';
import NewsDetail from './pages/public/NewsDetail';
import Schedule from './pages/public/Schedule';
import Requests from './pages/public/Requests';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminRequests from './pages/admin/AdminRequests';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminMessages from './pages/admin/AdminMessages';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="noticias" element={<News />} />
          <Route path="noticias/:id" element={<NewsDetail />} />
          <Route path="programacao" element={<Schedule />} />
          <Route path="pedidos" element={<Requests />} />
          <Route path="a-radio" element={<About />} />
          <Route path="contato" element={<Contact />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="noticias" element={<AdminNews />} />
          <Route path="programacao" element={<AdminPrograms />} />
          <Route path="pedidos" element={<AdminRequests />} />
          <Route path="mensagens" element={<AdminMessages />} />
          <Route path="configuracoes" element={<AdminSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;