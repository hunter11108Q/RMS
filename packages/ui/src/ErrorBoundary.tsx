import React, { Component, ErrorInfo, ReactNode } from 'react';
import { colors } from '@rms/theme';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    // Pipe logs to client crash reporting channels
    console.error('ErrorBoundary captured exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return React.createElement(
        'div',
        {
          style: {
            padding: '24px',
            backgroundColor: colors.background,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif',
          },
        },
        React.createElement('h2', { style: { color: colors.error, marginBottom: '8px' } }, 'Something went wrong'),
        React.createElement(
          'p',
          { style: { color: colors.muted, marginBottom: '16px', fontSize: '14px', textAlign: 'center' } },
          this.state.error?.message || 'An unexpected application error occurred.'
        ),
        React.createElement(
          'button',
          {
            onClick: () => {
              if (typeof window !== 'undefined' && window.location) {
                window.location.reload();
              }
            },
            style: {
              padding: '10px 20px',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            },
          },
          'Reload Interface'
        )
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
