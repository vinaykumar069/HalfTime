import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Shield, 
  Sparkles, 
  Database,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Inbox,
  Clock
} from 'lucide-react';
import { 
  supabase, 
  isSupabaseConfigured, 
  getCurrentAuthenticatedUser,
  getFriendlyAuthErrorMessage,
  getEmailProviderUrl,
  resendConfirmationEmail
} from '../../lib/supabase';

export type AuthModalView = 'signin' | 'signup' | 'unconfirmed' | 'confirmed' | 'authenticated';

export type UnconfirmedSource = 'signup' | 'signin';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange?: () => void;
  initialView?: AuthModalView;
  initialEmail?: string;
  initialUnconfirmedSource?: UnconfirmedSource;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthChange,
  initialView = 'signin',
  initialEmail = '',
  initialUnconfirmedSource = 'signup',
}) => {
  const [view, setView] = useState<AuthModalView>(initialView);
  const [unconfirmedSource, setUnconfirmedSource] = useState<UnconfirmedSource>(initialUnconfirmedSource);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
  
  // Action Loading & Errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend State & Cooldown
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);
  const [resendErrorMsg, setResendErrorMsg] = useState<string | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendStatusMsg(null);
    setResendErrorMsg(null);

    if (initialEmail) {
      setEmail(initialEmail);
    }
    if (initialView) {
      setView(initialView);
    }
    if (initialUnconfirmedSource) {
      setUnconfirmedSource(initialUnconfirmedSource);
    }

    checkAuth();
  }, [isOpen, initialView, initialEmail, initialUnconfirmedSource]);

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const checkAuth = async () => {
    if (isSupabaseConfigured && supabase) {
      const user = await getCurrentAuthenticatedUser();
      setUserSession(user);
      if (user && view !== 'confirmed' && view !== 'unconfirmed') {
        setView('authenticated');
      }
    } else {
      setUserSession(null);
    }
  };

  if (!isOpen) return null;

  // 1. Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendStatusMsg(null);
    setResendErrorMsg(null);
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase storage is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      }

      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const friendly = getFriendlyAuthErrorMessage(error);
        if (friendly.isUnconfirmed) {
          setUnconfirmedSource('signin');
          setView('unconfirmed');
          return;
        }
        setErrorMsg(friendly.message);
      } else if (data.user) {
        setUserSession(data.user);
        setSuccessMsg('Successfully signed in! Your workspace is ready.');
        setTimeout(() => {
          onClose();
          onAuthChange?.();
        }, 800);
      }
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setErrorMsg(friendly.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendStatusMsg(null);
    setResendErrorMsg(null);
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase storage is not configured. Please configure valid Supabase credentials.');
      }

      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        const friendly = getFriendlyAuthErrorMessage(error);
        setErrorMsg(friendly.message);
      } else if (data.user) {
        if (data.session) {
          setUserSession(data.user);
          setSuccessMsg('Account created successfully! You are now signed in.');
          setTimeout(() => {
            onClose();
            onAuthChange?.();
          }, 1000);
        } else {
          setPassword('');
          setUnconfirmedSource('signup');
          setView('unconfirmed');
          setResendCooldown(60);
        }
      }
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setErrorMsg(friendly.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend Confirmation Handler
  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatusMsg(null);
    setResendErrorMsg(null);

    const { success, error } = await resendConfirmationEmail(email);

    setIsResending(false);
    if (success) {
      setResendStatusMsg('Confirmation email sent.');
      setResendCooldown(60);
    } else {
      setResendErrorMsg(error || 'Failed to resend confirmation email. Please try again.');
    }
  };

  // 4. Sign Out Handler
  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUserSession(null);
      setView('signin');
      setSuccessMsg('Signed out successfully.');
      setTimeout(() => {
        onClose();
        onAuthChange?.();
      }, 700);
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setErrorMsg(friendly.message);
    } finally {
      setIsLoading(false);
    }
  };

  const providerInfo = getEmailProviderUrl(email);

  return (
    <div id="halftime-auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-elevated rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-[#F1F5F9]">
        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: UNCONFIRMED EMAIL SCREEN                                          */}
        {/* ========================================================================= */}
        {view === 'unconfirmed' && (
          <div id="auth-unconfirmed-screen" className="space-y-5 animate-in fade-in">
            {/* Header Icon */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFAA00]/15 border border-[#FFAA00]/30 flex items-center justify-center text-[#FFAA00] shadow-inner">
                <Inbox className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
                  {unconfirmedSource === 'signup' ? 'CHECK YOUR EMAIL' : 'EMAIL NOT CONFIRMED'}
                </h2>
                <p className="text-xs text-[#00D2FF] font-mono">
                  {unconfirmedSource === 'signup' ? 'Supabase Account Verification' : 'Verification Required'}
                </p>
              </div>
            </div>

            {/* Explanatory Message */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs text-slate-200 leading-relaxed">
              {unconfirmedSource === 'signup' ? (
                <>
                  <p className="font-medium">
                    We&apos;ve created your <span className="text-[#00F59B] font-bold">HALFTIME</span> account.
                  </p>
                  <p className="text-[#94A3B8]">
                    Please confirm your email address using the link we sent you before signing in.
                  </p>
                </>
              ) : (
                <p className="font-medium text-[#FFAA00]">
                  Please confirm your email address before signing in.
                </p>
              )}

              {/* Target Email Box */}
              <div className="pt-2">
                <div className="px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-[#00F59B] shrink-0" />
                    <span className="text-white font-bold truncate">{email || 'your email'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFAA00]/20 text-[#FFAA00] font-bold uppercase tracking-wider shrink-0">
                    PENDING
                  </span>
                </div>
              </div>
            </div>

            {/* Resend Status / Error Feedback */}
            {resendStatusMsg && (
              <div className="p-3.5 rounded-xl bg-[#00F59B]/15 border border-[#00F59B]/30 flex items-center gap-2.5 text-xs text-[#00F59B] font-mono animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resendStatusMsg}</span>
              </div>
            )}

            {resendErrorMsg && (
              <div className="p-3.5 rounded-xl bg-[#FF2A5F]/15 border border-[#FF2A5F]/30 flex items-center gap-2.5 text-xs text-[#FF2A5F] font-mono animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resendErrorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                id="auth-open-email-btn"
                href={providerInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D2FF] text-[#07090E] font-mono text-xs font-black transition shadow-lg glow-emerald cursor-pointer"
              >
                <span>{providerInfo.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                id="auth-resend-email-btn"
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-mono text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SENDING...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-[#FFAA00]" />
                    <span>RESEND IN {resendCooldown}s</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>RESEND CONFIRMATION EMAIL</span>
                  </>
                )}
              </button>

              <button
                id="auth-back-to-signin-btn"
                type="button"
                onClick={() => {
                  setView('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[#94A3B8] hover:text-white font-mono text-xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{unconfirmedSource === 'signin' ? 'TRY AGAIN' : 'BACK TO SIGN IN'}</span>
              </button>
            </div>

            {/* Helpful Instructions Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-[#64748B] space-y-1">
              <p className="font-bold text-[#94A3B8] font-mono">Didn&apos;t receive it?</p>
              <ul className="space-y-1 list-disc list-inside leading-relaxed">
                <li>Check your spam or junk folder.</li>
                <li>If you still don&apos;t see it, resend the confirmation email.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CONFIRMED SUCCESS SCREEN                                          */}
        {/* ========================================================================= */}
        {view === 'confirmed' && (
          <div id="auth-confirmed-screen" className="space-y-6 text-center animate-in fade-in py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00F59B]/15 border border-[#00F59B]/40 flex items-center justify-center text-[#00F59B] mx-auto shadow-lg glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white font-mono">EMAIL CONFIRMED</h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Your account is ready. You can now sign in to your workspace.
              </p>
            </div>

            <button
              id="auth-confirmed-signin-btn"
              onClick={() => {
                setView('signin');
                setErrorMsg(null);
              }}
              className="w-full py-3 rounded-xl bg-[#00F59B] hover:bg-[#20ffac] text-[#07090E] font-mono text-xs font-black transition shadow-lg glow-emerald cursor-pointer"
            >
              SIGN IN NOW
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: AUTHENTICATED ACCOUNT SCREEN                                      */}
        {/* ========================================================================= */}
        {view === 'authenticated' && userSession && (
          <div id="auth-authenticated-screen" className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F59B]/15 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Authenticated Account</h2>
                <p className="text-xs text-[#64748B]">Supabase Auth &amp; Row Level Security</p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-[#00F59B]/15 border border-[#00F59B]/30 flex items-start gap-2.5 text-xs text-[#00F59B]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-mono uppercase">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00F59B]/20 text-[#00F59B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B] animate-pulse" />
                  AUTHENTICATED
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] font-mono block mb-0.5">Email</span>
                <span className="text-sm font-mono text-white break-all">{userSession.email || 'Supabase User'}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] font-mono block mb-0.5">User ID (RLS Protected)</span>
                <span className="text-xs font-mono text-[#94A3B8] break-all">{userSession.id}</span>
              </div>
            </div>

            <button
              id="auth-signout-btn"
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF2A5F]/15 hover:bg-[#FF2A5F]/25 text-[#FF2A5F] border border-[#FF2A5F]/40 font-mono text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoading ? 'SIGNING OUT...' : 'SIGN OUT'}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: SIGN IN / SIGN UP FORM                                            */}
        {/* ========================================================================= */}
        {(view === 'signin' || view === 'signup') && (
          <div id="auth-form-screen" className="animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#00F59B]/15 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-mono">
                  {view === 'signin' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  Supabase Auth &amp; Row Level Security
                </p>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#FF2A5F]/15 border border-[#FF2A5F]/30 flex items-start gap-2.5 text-xs text-[#FF2A5F] animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#00F59B]/15 border border-[#00F59B]/30 flex items-start gap-2.5 text-xs text-[#00F59B] animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#FFAA00]/15 border border-[#FFAA00]/30 text-[#FFAA00] text-xs flex items-start gap-2">
                <Database className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Supabase is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live cloud sign-in.</span>
              </div>
            )}

            <form onSubmit={view === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="auth-input-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="builder@hackathon.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F59B] font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-[#94A3B8]">Password</label>
                  {view === 'signup' && (
                    <span className="text-[10px] text-[#64748B] font-mono">Min 6 chars</span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="auth-input-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F59B] font-mono"
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D2FF] text-[#07090E] font-mono text-xs font-black transition-all shadow-lg glow-emerald cursor-pointer disabled:opacity-50 mt-6"
              >
                {isLoading ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{view === 'signin' ? 'SIGN IN WITH SUPABASE' : 'CREATE ACCOUNT'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                id="auth-toggle-mode-btn"
                onClick={() => {
                  setView(view === 'signin' ? 'signup' : 'signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-[#00D2FF] hover:underline font-mono cursor-pointer"
              >
                {view === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
