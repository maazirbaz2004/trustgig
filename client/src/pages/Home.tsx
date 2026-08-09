import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, Lock, Users, ArrowRight, LayoutGrid } from 'lucide-react';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { Btn } from '../components/ui/Btn';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.paper, fontFamily: 'Inter, sans-serif' }}>
      
      {/* ─── Navbar ─── */}
      <nav style={{
        height: 72, 
        backgroundColor: T.white, 
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(55,47,140,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: T.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>
            TrustGig
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <Btn variant="indigo" onClick={() => navigate('/dashboard')} style={{ padding: '0 20px', height: 40 }}>
              <LayoutGrid size={16} strokeWidth={2.5} />
              Go to Dashboard
            </Btn>
          ) : (
            <>
              <Link to="/login" style={{ 
                color: T.muted, textDecoration: 'none', fontWeight: 600, fontSize: 14, 
                padding: '8px 16px', borderRadius: 6, transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = T.bg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Sign In
              </Link>
              <Btn variant="indigo" onClick={() => navigate('/register')} style={{ padding: '0 24px', height: 40 }}>
                Join Now
                <ArrowRight size={16} strokeWidth={2.5} />
              </Btn>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{ 
        padding: '100px 40px 120px', 
        textAlign: 'center', 
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: `linear-gradient(180deg, ${T.white} 0%, ${T.bg} 100%)`
      }}>
        <div style={{ 
          backgroundColor: T.indigoTint, color: T.indigo, 
          padding: '6px 16px', borderRadius: 99, 
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, 
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24,
          border: `1px solid ${T.indigo}30`
        }}>
          Pakistan's Most Secure Marketplace
        </div>
        
        <h1 style={{ 
          fontFamily: 'Fraunces, serif', fontSize: 64, fontWeight: 700, 
          color: T.ink, margin: '0 0 24px', lineHeight: 1.1, letterSpacing: '-0.03em',
          maxWidth: 800
        }}>
          Hire top talent with <span style={{ color: T.indigo }}>zero risk.</span>
        </h1>
        
        <p style={{ 
          fontSize: 18, color: T.muted, margin: '0 0 40px', lineHeight: 1.6, 
          maxWidth: 600 
        }}>
          TrustGig connects you with verified Pakistani freelancers. 
          Your funds are held securely in escrow until you approve the final work. No scams, just results.
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            style={{
              height: 54, padding: '0 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
              backgroundColor: T.indigo, color: T.white,
              fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600,
              boxShadow: '0 4px 16px rgba(55,47,140,0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex', alignItems: 'center', gap: 10
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(55,47,140,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(55,47,140,0.25)'; }}
          >
            Get Started Free
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
          
          <button 
            style={{
              height: 54, padding: '0 32px', borderRadius: 12, cursor: 'pointer',
              backgroundColor: T.white, color: T.ink,
              border: `1.5px solid ${T.border}`,
              fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.bg; e.currentTarget.style.borderColor = T.subtle; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.white; e.currentTarget.style.borderColor = T.border; }}
          >
            How it Works
          </button>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section style={{ padding: '80px 40px', backgroundColor: T.white, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: T.ink, margin: '0 0 16px' }}>
              Why choose TrustGig?
            </h2>
            <p style={{ fontSize: 16, color: T.muted, margin: 0 }}>
              We've engineered trust into every step of the freelance process.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            
            {/* Feature 1 */}
            <div style={{ padding: 32, borderRadius: 16, backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: T.indigoTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Lock size={24} color={T.indigo} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: '0 0 12px' }}>Escrow Protection</h3>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6, margin: 0 }}>
                Clients deposit funds upfront into our secure Meezan Bank account. Freelancers know they'll get paid, and clients only release funds when satisfied.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: 32, borderRadius: 16, backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: T.greenTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <CheckCircle size={24} color={T.green} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: '0 0 12px' }}>KYC Verified Talent</h3>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6, margin: 0 }}>
                Every freelancer undergoes a strict manual CNIC verification process by our admin team before they can start selling services.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: 32, borderRadius: 16, backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Users size={24} color={T.amber} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: '0 0 12px' }}>Fair Dispute Resolution</h3>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6, margin: 0 }}>
                If things don't go as planned, our dedicated admin moderation team steps in to review the work and distribute funds fairly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section style={{ padding: '100px 40px', backgroundColor: T.sidebar, color: T.white, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 700, margin: '0 0 24px' }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', maxWidth: 500, marginInline: 'auto', lineHeight: 1.6 }}>
          Join thousands of professionals trading services securely in Pakistan.
        </p>
        <button 
          onClick={() => navigate(user ? '/dashboard' : '/register')}
          style={{
            height: 54, padding: '0 40px', borderRadius: 12, border: 'none', cursor: 'pointer',
            backgroundColor: T.white, color: T.indigoDark,
            fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {user ? 'Go to Dashboard' : 'Create Free Account'}
        </button>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '40px', backgroundColor: T.white, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color={T.muted} strokeWidth={2.5} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.subtle }}>
            © {new Date().getFullYear()} TrustGig Pvt Ltd.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 14, color: T.muted }}>
          <span style={{ cursor: 'pointer' }}>Terms</span>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }}>Contact</span>
        </div>
      </footer>
    </div>
  );
}
