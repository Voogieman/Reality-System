import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portal render error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="section">
        <div className="container">
          <h2 className="section-title">Страница не открылась</h2>
          <p className="section-subtitle">Обнови портал и продолжи путь.</p>
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={() => this.setState({ hasError: false })}>
              Продолжить
            </button>
          </div>
        </div>
      </section>
    );
  }
}
