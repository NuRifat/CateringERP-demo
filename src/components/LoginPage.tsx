import React, { useState } from 'react';
import { Utensils, Lock, User, ArrowRight, KeyRound, ChevronDown } from 'lucide-react';
import { useERP } from '../context/ERPContext';

export const LoginPage: React.FC = () => {
  const { login, users } = useERP();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [showCreds, setShowCreds] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(username, password);
    if (!res.ok) setError(res.error || 'Login failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50/60 to-sky-100/50 flex flex-col justify-between p-6">
      {/* Top Bar with User/Demo Details in Top Right */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-200">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold text-slate-800 tracking-tight">
            Yummy Catering
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCreds((v) => !v)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-sky-200 hover:border-sky-300 rounded-xl text-xs font-medium text-sky-700 shadow-xs transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-500" />
            Demo User Details
            <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {showCreds && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-sky-100 rounded-2xl shadow-lg p-3 z-20">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-2 border-b border-slate-100">
                Click to fill (Password: demo)
              </div>
              <div className="mt-1.5 space-y-1 max-h-64 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUsername(u.role === 'management' ? 'admin' : u.role);
                      setPassword('demo');
                      setShowCreds(false);
                      setError('');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-sky-50 transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.department}</div>
                    </div>
                    <span className="text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {u.role === 'management' ? 'admin' : u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Centered Login Card */}
      <div className="w-full max-w-sm mx-auto my-auto">
        <div className="bg-white border border-sky-100 rounded-2xl p-8 shadow-sm shadow-sky-100/70">
          <div className="mb-6">
            <span className="inline-block px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 text-[11px] font-semibold border border-sky-100 mb-3">
              Yummy Catering ERP
            </span>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in with your username and password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-sky-50/30 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-sky-50/30 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-sky-200 transition cursor-pointer mt-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="text-center text-xs text-slate-400">
        Yummy Catering • Integrated Business Management Demo
      </div>
    </div>
  );
};
