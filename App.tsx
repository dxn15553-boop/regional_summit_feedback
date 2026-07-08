import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import FeedbackForm from './components/FeedbackForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { UserRole } from './types';

const Sidebar: React.FC<{ isLoggedIn: boolean; onLogout: () => void }> = ({ isLoggedIn, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:relative md:w-64 md:h-screen flex md:flex-col z-[100] flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #060915 0%, #0d1526 100%)',
        borderRight: '1px solid rgba(212,175,55,0.12)',
        borderTop: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      {/* Logo / Branding — desktop only */}
      <div className="hidden md:flex flex-col items-center gap-2 p-7 pb-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        <div
          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center mb-1"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.35)',
            boxShadow: '0 0 20px rgba(212,175,55,0.2)',
          }}
        >
          <span
            className="font-display font-bold text-xl"
            style={{
              background: 'linear-gradient(135deg, #b8941f, #d4af37, #ecbc2d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DXN
          </span>
        </div>
        <div className="text-center">
          <p className="text-champagne font-semibold text-sm tracking-wide">South Asia Regional Manufacturing Summit</p>
          <p className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(184,176,160,0.4)' }}>
            Feedback Portal · 2026
          </p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex flex-1 justify-around md:flex-col md:justify-start md:p-4 md:pt-5 gap-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3.5 md:rounded-xl transition-all duration-200 group"
          style={{
            background: isActive('/') ? 'rgba(212,175,55,0.1)' : 'transparent',
            border: isActive('/') ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
            color: isActive('/') ? '#d4af37' : 'rgba(184,176,160,0.55)',
          }}
        >
          {/* Feedback icon */}
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 2.5 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <div className="md:block">
            <p className="text-sm font-semibold">Submit Feedback</p>
            <p className="text-[10px] tracking-wider hidden md:block" style={{ color: 'rgba(184,176,160,0.35)' }}>Guest Portal</p>
          </div>
          {isActive('/') && (
            <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#d4af37', boxShadow: '0 0 8px rgba(212,175,55,0.8)' }} />
          )}
        </Link>

        <Link
          to="/admin"
          className="flex items-center gap-3 px-4 py-3.5 md:rounded-xl transition-all duration-200 group"
          style={{
            background: isActive('/admin') ? 'rgba(212,175,55,0.1)' : 'transparent',
            border: isActive('/admin') ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
            color: isActive('/admin') ? '#d4af37' : 'rgba(184,176,160,0.55)',
          }}
        >
          {/* Dashboard icon */}
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/admin') ? 2.5 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3h7.5M3.75 3v7.5M3.75 3L10.5 10.5M3.75 21h7.5M3.75 21v-7.5M3.75 21L10.5 13.5M21 3.75h-7.5M21 3.75v7.5M21 3.75L13.5 10.5M21 20.25h-7.5M21 20.25v-7.5m0 7.5L13.5 13.5" />
          </svg>
          <div className="md:block">
            <p className="text-sm font-semibold">Dashboard</p>
            <p className="text-[10px] tracking-wider hidden md:block" style={{ color: 'rgba(184,176,160,0.35)' }}>Analytics & Reports</p>
          </div>
          {isActive('/admin') && (
            <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#d4af37', boxShadow: '0 0 8px rgba(212,175,55,0.8)' }} />
          )}
        </Link>
      </div>

      {/* Logout — desktop only */}
      {isLoggedIn && (
        <div className="hidden md:block p-4" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
            style={{ color: 'rgba(239,68,68,0.7)', border: '1px solid transparent' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(239,68,68)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)';
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('dxn_auth') === 'true');
  const [userRole, setUserRole] = useState<UserRole>(() => (localStorage.getItem('dxn_role') as UserRole) || 'Viewer');

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('dxn_auth', 'true');
    localStorage.setItem('dxn_role', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('dxn_auth');
    localStorage.removeItem('dxn_role');
  };

  return (
    <HashRouter>
      <div
        className="flex flex-col md:flex-row min-h-screen"
        style={{ background: '#060915', color: '#f5f0e8' }}
      >
        <Sidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<FeedbackForm />} />
            <Route
              path="/admin"
              element={
                isLoggedIn
                  ? <AdminDashboard role={userRole} onLogout={handleLogout} />
                  : <Login onLogin={handleLogin} />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
