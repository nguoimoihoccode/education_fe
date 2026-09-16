import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Without a boundary React unmounts the entire tree on a render error, leaving
 * whatever index.html put inside #root on screen -- the "Đang chuẩn bị không
 * gian học tập" boot splash -- so a failed page looks like a page that never
 * finishes loading. Show something actionable instead.
 *
 * The markup deliberately uses the `app-boot-*` classes that index.html defines
 * in its own inline <style>, so it still renders when the stylesheet chunk is
 * itself the thing that failed to load.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <div className="app-boot-shell" role="alert">
        <div className="app-boot-card">
          <div className="app-boot-mark" aria-hidden="true" />
          <h1 className="app-boot-title">Không tải được trang</h1>
          <p className="app-boot-text">
            Có thể bản mới vừa được triển khai. Tải lại trang để nhận bản mới nhất.
          </p>
          <p className="app-boot-text" style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            {error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '12px 20px',
              border: 'none',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10b981, #8b5cf6)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}