import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertTriangle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { T } from '../theme/tokens';
import { Btn } from '../components/ui/Btn';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      // Determine where to redirect based on role, defaulting to dashboard
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      <Link to="/" style={{ 
        position: 'absolute', top: 32, left: 32, 
        textDecoration: 'none', color: T.muted, 
        display: 'flex', alignItems: 'center', gap: 6, 
        fontSize: 14, fontWeight: 600,
        transition: 'color 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.color = T.indigo}
        onMouseLeave={e => e.currentTarget.style.color = T.muted}
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Home
      </Link>
      <div style={{
        backgroundColor: T.white,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        boxShadow: "0 10px 40px rgba(55,47,140,0.08)",
        width: "100%", maxWidth: 440,
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: T.sidebar,
          padding: "32px 32px 24px",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center"
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            backgroundColor: T.indigo,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}>
            <Shield size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 600,
            color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em"
          }}>
            Welcome Back
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>
            Sign in to your TrustGig account to continue.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: 32 }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 8,
              backgroundColor: T.redTint, border: `1px solid ${T.red}30`,
              marginBottom: 20
            }}>
              <AlertTriangle size={16} strokeWidth={2.5} style={{ color: T.red, flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: T.red, margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%', height: 40,
                    padding: '0 16px 0 40px',
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    fontSize: 14, fontFamily: 'Inter, sans-serif',
                    color: T.ink, outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = T.indigo}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', height: 40,
                    padding: '0 40px 0 40px',
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    fontSize: 14, fontFamily: 'Inter, sans-serif',
                    color: T.ink, outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = T.indigo}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: 12,
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} color={T.muted} /> : <Eye size={16} color={T.muted} />}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <Btn type="submit" variant="indigo" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={16} strokeWidth={2} />}
              </Btn>
            </div>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: T.indigo, fontWeight: 600, textDecoration: 'none' }}>
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
