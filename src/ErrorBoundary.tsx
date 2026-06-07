import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error | null, reset: () => void) => ReactNode);
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `ErrorBoundary caught an error in "${this.props.name || 'Component'}":`,
      error,
      errorInfo
    );
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          const fallbackFn = this.props.fallback as (error: Error | null, reset: () => void) => ReactNode;
          return fallbackFn(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-rose-500/30 rounded-2xl bg-rose-500/5 backdrop-blur-md space-y-4 animate-fadeIn my-4">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-150">
              {this.props.name || 'Widget'} failed to load
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred in this section.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition duration-200 cursor-pointer active:scale-[0.97]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Widget</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
