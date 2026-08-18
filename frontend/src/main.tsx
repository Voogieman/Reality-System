import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { LandingProvider } from './landing/LandingContext';
import App from './App';
import './styles/global.css';
import './styles/background.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LandingProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </LandingProvider>
    </AuthProvider>
  </StrictMode>,
);
