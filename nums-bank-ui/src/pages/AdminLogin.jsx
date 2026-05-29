import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      triggerShake();
      return;
    }

    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Authentication failed.');
      triggerShake();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0F1A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`relative w-full max-w-md transition-all duration-300 ${shake ? 'animate-bounce' : ''}`}
        style={{ animation: shake ? 'shake 0.4s ease-in-out' : 'none' }}
      >
        {/* Top security banner */}
        <div className="bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
          <p className="text-[10px] text-red-300 font-medium tracking-wide">
            RESTRICTED SYSTEM — Authorized Bank Personnel Only. All access attempts are logged and audited.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-7 h-7 text-yellow-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-wide">NUMS BANK</h1>
              <p className="text-[11px] text-yellow-400/80 font-semibold tracking-widest uppercase mt-0.5">
                Admin Operations Portal
              </p>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-xl px-4 py-3 mb-5 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@numsbank.com"
                  autoComplete="off"
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-12 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 focus:bg-slate-800 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Authorize Access
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] text-slate-500 hover:text-yellow-400 transition-colors font-medium"
            >
              ← Customer NetBanking Portal
            </button>
          </div>
        </div>

        {/* Bottom badge */}
        <p className="text-center text-[10px] text-slate-600 mt-4">
          © 2025 NUMS Bank · Admin Console v1.0 · 256-bit SSL Encrypted
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          45% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
