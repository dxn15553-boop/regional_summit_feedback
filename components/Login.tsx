import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate brief auth delay for premium feel
    await new Promise((r) => setTimeout(r, 600));

    const user = username.trim().toLowerCase();
    const pass = password.trim();

    if (user === 'admin' && pass === 'admin123') {
      onLogin('Admin');
    } else if (user === 'viewer' && pass === 'view123') {
      onLogin('Viewer');
    } else {
      setError('Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #060915 0%, #0d1526 60%, #111d44 100%)',
      }}
    >
      {/* Background orb */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-fadeIn">
        {/* Top badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-semibold tracking-[0.2em] uppercase mb-6"
            style={{ border: '1px solid rgba(212,175,55,0.25)', color: 'rgba(212,175,55,0.7)', background: 'rgba(212,175,55,0.06)' }}>
            DXN SOUTH ASIA REGIONAL MANUFACTURING SUMMIT · ADMIN
          </div>

          {/* DXN logo */}
          <div className="mx-auto w-20 h-20 rounded-2xl flex flex-col items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.04))',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 0 25px rgba(212,175,55,0.18)',
            }}>
            <span className="font-display font-bold text-2xl"
              style={{
                background: 'linear-gradient(135deg, #b8941f, #d4af37, #ecbc2d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              DXN
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-champagne">Analytics Portal</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(184,176,160,0.55)' }}>
            Sign in to access the dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl p-8 space-y-5"
          style={{
            background: 'linear-gradient(135deg, rgba(17,29,68,0.9), rgba(13,21,38,0.95))',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>

          {error && (
            <div className="p-3.5 rounded-xl text-sm flex items-center gap-3 animate-shake"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(252,165,165,0.9)' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgba(184,176,160,0.6)' }}>
                Username
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,55,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="luxury-input pl-10"
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgba(184,176,160,0.6)' }}>
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,55,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="luxury-input pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Access Dashboard
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-5 p-5 rounded-xl"
          style={{
            background: 'rgba(13,21,38,0.6)',
            border: '1px solid rgba(212,175,55,0.08)',
          }}>
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: 'rgba(184,176,160,0.3)' }}>
            Demo Credentials
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: 'rgba(184,176,160,0.5)' }}>Administrator</span>
              <code className="font-mono font-semibold text-champagne/70 bg-midnight-800/60 px-2 py-0.5 rounded text-[11px]">
                admin / admin123
              </code>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: 'rgba(184,176,160,0.5)' }}>Viewer Only</span>
              <code className="font-mono font-semibold text-champagne/70 bg-midnight-800/60 px-2 py-0.5 rounded text-[11px]">
                viewer / view123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
