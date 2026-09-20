import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { STORAGE_KEYS, removeKey } from '../../engine/storage';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence: a broken style definition or a rendering bug shows a
 * recoverable screen instead of a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('UI Explorer crashed while rendering.', error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  private resetStoredStyles = () => {
    removeKey(STORAGE_KEYS.customStyles);
    removeKey(STORAGE_KEYS.styleId);
    removeKey(STORAGE_KEYS.compare);
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="app-error" role="alert">
        <div className="app-error__card">
          <h1>Something broke while rendering.</h1>
          <p>
            This usually means a saved or imported style is missing a token. Reloading keeps your data;
            resetting removes saved custom styles and starts clean.
          </p>
          <pre className="app-error__detail">{this.state.error.message}</pre>
          <div className="app-error__actions">
            <button type="button" className="app-error__btn app-error__btn--primary" onClick={this.reload}>
              Reload
            </button>
            <button type="button" className="app-error__btn" onClick={this.resetStoredStyles}>
              Reset saved styles
            </button>
          </div>
        </div>
      </div>
    );
  }
}
