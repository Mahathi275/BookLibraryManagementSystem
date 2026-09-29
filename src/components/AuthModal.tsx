import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, AlertCircle, Check } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'librarian' | 'member'>('librarian');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fillDemoLibrarian = () => {
    setEmail('librarian@citylibrary.org');
    setPassword('password123');
    setError(null);
  };

  const fillDemoMember = () => {
    setEmail('member@university.edu');
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      if (mode === 'login') {
        const response = await api.login({ email, password });
        if (response.data?.user) {
          if (response.data.token) {
            localStorage.setItem('library_auth_token', response.data.token);
          }
          localStorage.setItem('library_user', JSON.stringify(response.data.user));
          onAuthSuccess(response.data.user);
          onClose();
        }
      } else {
        const response = await api.signup({ name, email, password, role });
        if (response.data?.user) {
          if (response.data.token) {
            localStorage.setItem('library_auth_token', response.data.token);
          }
          localStorage.setItem('library_user', JSON.stringify(response.data.user));
          setSuccessMsg('Account registered successfully!');
          setTimeout(() => {
            onAuthSuccess(response.data!.user);
            onClose();
          }, 600);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-100">
                {mode === 'login' ? 'Library Portal Sign In' : 'Create Library Account'}
              </h3>
              <p className="text-xs text-neutral-400">
                {mode === 'login'
                  ? 'Access catalog administration & loan management'
                  : 'Register a staff or patron library card'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-neutral-950 border border-neutral-800 rounded-lg mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-neutral-800 text-neutral-100 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-neutral-800 text-neutral-100 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
                />
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Email Address <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="librarian@citylibrary.org"
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Password <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('librarian')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    role === 'librarian'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-semibold">Librarian</div>
                  <div className="text-[10px] text-neutral-500">Manage catalog & issue loans</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    role === 'member'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-semibold">Patron / Member</div>
                  <div className="text-[10px] text-neutral-500">Borrow & reserve titles</div>
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Credentials for Fast Testing */}
          {mode === 'login' && (
            <div className="pt-2">
              <div className="text-[11px] text-neutral-400 mb-1.5 flex items-center justify-between">
                <span>Quick demo logins:</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fillDemoLibrarian}
                  className="flex-1 py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-neutral-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Staff Librarian
                </button>
                <button
                  type="button"
                  onClick={fillDemoMember}
                  className="flex-1 py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-neutral-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Patron Member
                </button>
              </div>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Sign In to Library'
                : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
