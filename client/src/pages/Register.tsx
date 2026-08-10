import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, MapPin, Phone, AlertTriangle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { T } from '../theme/tokens';
import { Btn } from '../components/ui/Btn';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    city: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(formData);
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: "40px 24px",
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
        width: "100%", maxWidth: 500,
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
            Join TrustGig
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>
            Create an account to hire professionals or offer your services.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Role Selection */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <label style={{
                flex: 1, padding: "12px", borderRadius: 8, cursor: "pointer",
                border: `1.5px solid ${formData.role === 'client' ? T.indigo : T.border}`,
                backgroundColor: formData.role === 'client' ? T.indigoTint : T.white,
                display: "flex", alignItems: "center", gap: 10
              }}>
                <input type="radio" name="role" value="client" checked={formData.role === 'client'} onChange={handleChange} style={{ display: 'none' }} />
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${formData.role === 'client' ? T.indigo : T.muted}`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {formData.role === 'client' && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: T.indigo }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: formData.role === 'client' ? T.indigoDark : T.ink }}>I'm a Client</span>
              </label>
              <label style={{
                flex: 1, padding: "12px", borderRadius: 8, cursor: "pointer",
                border: `1.5px solid ${formData.role === 'freelancer' ? T.indigo : T.border}`,
                backgroundColor: formData.role === 'freelancer' ? T.indigoTint : T.white,
                display: "flex", alignItems: "center", gap: 10
              }}>
                <input type="radio" name="role" value="freelancer" checked={formData.role === 'freelancer'} onChange={handleChange} style={{ display: 'none' }} />
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${formData.role === 'freelancer' ? T.indigo : T.muted}`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {formData.role === 'freelancer' && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: T.indigo }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: formData.role === 'freelancer' ? T.indigoDark : T.ink }}>I'm a Freelancer</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ali Khan" required
                    style={{ width: '100%', height: 40, padding: '0 16px 0 40px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ali@example.com" required
                    style={{ width: '100%', height: 40, padding: '0 16px 0 40px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>City</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Lahore" required
                    style={{ width: '100%', height: 40, padding: '0 16px 0 40px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0300 1234567" required
                    style={{ width: '100%', height: 40, padding: '0 16px 0 40px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={T.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required
                  style={{ width: '100%', height: 40, padding: '0 40px 0 40px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border}
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

            <div style={{ marginTop: 12 }}>
              <Btn type="submit" variant="indigo" size="lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight size={16} strokeWidth={2} />}
              </Btn>
            </div>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: T.indigo, fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
