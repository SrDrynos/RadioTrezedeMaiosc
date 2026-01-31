
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
import TV from './pages/public/TV'; 
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfUse from './pages/public/TermsOfUse';
import CookiePolicy from './pages/public/CookiePolicy';

// Fluxx Ecosystem Pages
import { 
  StartupFluxx, 
  ProtoToken, 
  HubStream, 
  ProtoRider, 
  GrauShop, 
  LoucosPorGrau 
} from './pages/public/FluxxPages';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTraffic from './pages/admin/AdminTraffic';
import AdminTVConfig from './pages/admin/AdminTVConfig';
import AdminNews from './pages/admin/AdminNews';
import AdminRequests from './pages/admin/AdminRequests';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSponsors from './pages/admin/AdminSponsors';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="tv" element={<TV />} />
          <Route path="noticias" element={<News />} />
          <Route path="noticias/:id" element={<NewsDetail />} />
          <Route path="programacao" element={<Schedule />} />
          <Route path="pedidos" element={<Requests />} />
          <Route path="a-radio" element={<About />} />
          <Route path="contato" element={<Contact />} />
          
          {/* Fluxx Ecosystem Routes */}
          <Route path="fluxx" element={<StartupFluxx />} />
          <Route path="proto-token" element={<ProtoToken />} />
          <Route path="hub-stream" element={<HubStream />} />
          <Route path="proto-rider" element={<ProtoRider />} />
          <Route path="grau-shop" element={<GrauShop />} />
          <Route path="loucos-por-grau" element={<LoucosPorGrau />} />

          {/* Legal Pages */}
          <Route path="politica-de-privacidade" element={<PrivacyPolicy />} />
          <Route path="termos-de-uso" element={<TermsOfUse />} />
          <Route path="politica-de-cookies" element={<CookiePolicy />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/painel" replace />} />
          
          <Route path="painel" element={<AdminPanel />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="trafego" element={<AdminTraffic />} />
          <Route path="tv-config" element={<AdminTVConfig />} />
          
          <Route path="noticias" element={<AdminNews />} />
          <Route path="programacao" element={<AdminPrograms />} />
          <Route path="pedidos" element={<AdminRequests />} />
          <Route path="patrocinadores" element={<AdminSponsors />} />
          <Route path="mensagens" element={<AdminMessages />} />
          <Route path="configuracoes" element={<AdminSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
