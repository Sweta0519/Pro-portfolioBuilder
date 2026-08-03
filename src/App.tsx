import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import { ErrorBoundary } from './ErrorBoundary';
import { ShieldAlert, Download, RefreshCcw } from 'lucide-react';

const GlobalErrorFallback = (error: Error | null, reset: () => void) => {
  const rescueData = () => {
    const activeResume = localStorage.getItem('pro_portfolio_active_resume');
    const savedResumes = localStorage.getItem('pro_portfolio_saved_resumes');

    if (!activeResume && !savedResumes) {
      alert('No active or saved resume data found in local storage to rescue.');
      return;
    }

    const rescuePayload = {
      activeResume: activeResume ? JSON.parse(activeResume) : null,
      savedResumes: savedResumes ? JSON.parse(savedResumes) : null,
      rescuedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(rescuePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pro_portfolio_resume_rescue.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      <div className="w-full max-w-2xl p-8 rounded-3xl border border-rose-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-6 animate-fadeIn">
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 ring-4 ring-rose-500/5">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Application Crash Rescued
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            An unexpected global error occurred. We have securely intercepted it to prevent loss of your active resume data.
          </p>
        </div>

        {error && (
          <div className="w-full text-left bg-slate-950/60 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-450 overflow-x-auto max-h-48 scrollbar-thin">
            <div className="font-bold text-rose-450 mb-1">{error.name}: {error.message}</div>
            {error.stack && <pre className="whitespace-pre-wrap leading-normal mt-1">{error.stack}</pre>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={rescueData}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Rescue Unsaved Resume Data</span>
          </button>

          <button
            onClick={() => {
              reset();
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-250 border border-slate-700 transition duration-200 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
            <span>Restart Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary name="ProPortfolio Application" fallback={GlobalErrorFallback}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </ErrorBoundary>
  );
}
