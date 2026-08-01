import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
          <AlertTriangle className="w-8 h-8 text-spotlight mb-4" />
          <h1 className="text-xl font-sans font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-muted mb-6 max-w-sm">
            The app hit an unexpected error. Reloading usually fixes it — your data is saved locally and won't be lost.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-spotlight text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-spotlight-dark transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
