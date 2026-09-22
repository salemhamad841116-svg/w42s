import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useCallback } from 'react';
import TradingApp from './trading/TradingApp';
import { useBrokerStore } from './trading/stores/brokerStore';

// ─── Super Admin Whitelist ───
// This is a private personal terminal. Only whitelisted emails are granted access.
const SUPER_ADMIN_WHITELIST: ReadonlySet<string> = new Set([
  'salemhamad841116@gmail.com',
]);

const AUTH_SESSION_KEY = 'superadmin_session';

interface AuthSession {
  email: string;
  authenticatedAt: number;
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Validate session is still from a whitelisted email
    if (SUPER_ADMIN_WHITELIST.has(session.email)) {
      return session;
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

function saveSession(email: string): void {
  const session: AuthSession = { email, authenticatedAt: Date.now() };
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

// ─── Login Screen ───
function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate brief auth delay for UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const normalizedEmail = email.trim().toLowerCase();

    if (!SUPER_ADMIN_WHITELIST.has(normalizedEmail)) {
      setError('Access denied. This terminal is restricted to authorized personnel only.');
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 1) {
      setError('Password is required.');
      setIsLoading(false);
      return;
    }

    saveSession(normalizedEmail);
    onLogin(normalizedEmail);
  }, [email, password, onLogin]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0B0E14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: '#151924',
          borderRadius: '16px',
          border: '1px solid #262B3D',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2962FF, #00E676)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}
          >
            {'$'}
          </div>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Private Trading Terminal
          </h1>
          <p style={{ color: '#8F9CAE', fontSize: '13px', marginTop: '8px' }}>
            Authorized access only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#8F9CAE', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0B0E14',
                border: '1px solid #262B3D',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#8F9CAE', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0B0E14',
                border: '1px solid #262B3D',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ff6b6b',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: isLoading ? '#333' : 'linear-gradient(135deg, #2962FF, #00E676)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Error Boundary ───
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#ff6b6b', backgroundColor: '#1a1d24', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>React Runtime Error Detected</h2>
          <pre style={{ backgroundColor: '#0f1117', padding: '16px', borderRadius: '8px', overflow: 'auto', border: '1px solid #ff4444' }}>
            {this.state.error?.toString()}
          </pre>
          <details style={{ marginTop: '16px', color: '#aaa', whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo?.componentStack}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2962FF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Main App with Auth Guard ───
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return loadSession() !== null;
  });

  const handleLogin = useCallback((email: string) => {
    setIsAuthenticated(true);
    console.log(`Super Admin authenticated: ${email}`);
  }, []);

  // Fetch live account data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      useBrokerStore.getState().fetchLiveAccountData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0B0E14', overflow: 'hidden' }}>
        <TradingApp />
      </div>
    </ErrorBoundary>
  );
}
