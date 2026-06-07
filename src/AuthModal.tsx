import { type FormEvent } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAuthStore } from './stores/authStore';
import { useFocusTrap } from './hooks/useFocusTrap';
import { supabase } from './supabaseClient';

export function AuthModal() {
  const showAuthModal = useAuthStore((s) => s.showAuthModal);
  const authMode = useAuthStore((s) => s.authMode);
  const authEmail = useAuthStore((s) => s.authEmail);
  const authPassword = useAuthStore((s) => s.authPassword);
  const authLoading = useAuthStore((s) => s.authLoading);
  const authError = useAuthStore((s) => s.authError);
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal);
  const setAuthMode = useAuthStore((s) => s.setAuthMode);
  const setAuthEmail = useAuthStore((s) => s.setAuthEmail);
  const setAuthPassword = useAuthStore((s) => s.setAuthPassword);
  const setAuthLoading = useAuthStore((s) => s.setAuthLoading);
  const setAuthError = useAuthStore((s) => s.setAuthError);
  const resetAuthForm = useAuthStore((s) => s.resetAuthForm);

  const authModalRef = useFocusTrap(showAuthModal, () => {
    if (!authLoading) setShowAuthModal(false);
  });

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      setAuthError('Authentication requires an active internet connection.');
      return;
    }
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) throw error;
        alert('Verification email sent! Check your inbox to complete sign up.');
      }
      setShowAuthModal(false);
      resetAuthForm();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!navigator.onLine) {
      setAuthError('Authentication requires an active internet connection.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Google Authentication failed.');
      setAuthLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <div
      ref={authModalRef as React.RefObject<HTMLDivElement>}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-955/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative animate-scaleUp">
        {!authLoading && (
          <button
            onClick={() => setShowAuthModal(false)}
            aria-label="Close authentication dialog"
            className="absolute top-4 right-4 text-slate-300 hover:text-white hover:bg-slate-800/50 p-1.5 rounded-lg transition duration-200 ease-out cursor-pointer active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-650 text-white p-2 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold">🔒</span>
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-extrabold text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-[11px] text-slate-550 font-semibold">
                {authMode === 'login'
                  ? 'Sign in to sync your data'
                  : 'Register to save your progress'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authError && (
              <div className="flex items-start gap-2.5 bg-rose-955/20 border border-rose-900/50 p-3 rounded-xl text-[11px] text-rose-350">
                <AlertCircle className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="e.g. you@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition duration-200 ease-out"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-955 border border-slate-800 focus:border-slate-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-655 focus:outline-none transition duration-200 ease-out"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-extrabold py-2.5 rounded-xl text-xs transition duration-200 ease-out shadow-md disabled:opacity-50 cursor-pointer active:scale-[0.97] flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <span className="animate-spin text-slate-200">⏳</span> Processing...
                </>
              ) : (
                <span>{authMode === 'login' ? '🔑 Sign In' : '📝 Register'}</span>
              )}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <hr className="border-slate-800" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={authLoading}
            className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 font-extrabold py-2.5 rounded-xl text-xs transition duration-200 ease-out flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.65 0 3.14.57 4.3 1.68l3.22-3.22C17.56 1.7 15.01 1 12 1 7.37 1 3.42 3.66 1.48 7.55l3.86 3C6.26 7.6 8.9 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.88 3.75-8.48z"
              />
              <path
                fill="#FBBC05"
                d="M5.34 14.55c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.58.38-2.3l-3.86-3C.53 8.89 0 10.39 0 12.01s.53 3.12 1.48 5.06l3.86-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.32 1.09-4.3 1.09-3.1 0-5.74-2.56-6.68-5.51l-3.86 3C3.42 20.34 7.37 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-[10px] text-slate-500 font-medium text-center mt-5">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
              }}
              className="text-slate-200 hover:text-slate-300 font-bold underline transition duration-200 ease-out cursor-pointer active:scale-[0.97]"
            >
              {authMode === 'login' ? 'Sign Up Free' : 'Sign In Here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
