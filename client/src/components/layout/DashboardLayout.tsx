import React from 'react';
import { Shield, LogOut, User, Scale, LayoutGrid, Package, CheckCircle, Briefcase, CreditCard, MessageSquare } from 'lucide-react';
import { T } from '../../theme/tokens';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function DashboardLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { path: '/admin', icon: <User size={14} strokeWidth={1.8} />, label: 'KYC Review' },
    { path: '/admin/disputes', icon: <Scale size={14} strokeWidth={1.8} />, label: 'Disputes' },
    { path: '/admin/deposits', icon: <CreditCard size={14} strokeWidth={1.8} />, label: 'Deposits' },
    { path: '/admin/withdrawals', icon: <CreditCard size={14} strokeWidth={1.8} />, label: 'Payouts' },
  ];

  const clientNav = [
    { path: '/dashboard', icon: <LayoutGrid size={14} strokeWidth={1.8} />, label: 'Dashboard' },
    { path: '/inbox', icon: <MessageSquare size={14} strokeWidth={1.8} />, label: 'Messages' },
    { path: '/gigs', icon: <Package size={14} strokeWidth={1.8} />, label: 'Explore Gigs' },
    { path: '/wallet', icon: <CreditCard size={14} strokeWidth={1.8} />, label: 'My Wallet' },
  ];

  const freelancerNav = [
    { path: '/dashboard', icon: <LayoutGrid size={14} strokeWidth={1.8} />, label: 'Dashboard' },
    { path: '/inbox', icon: <MessageSquare size={14} strokeWidth={1.8} />, label: 'Messages' },
    { path: '/gigs/new', icon: <Briefcase size={14} strokeWidth={1.8} />, label: 'My Gigs' },
    { path: '/wallet', icon: <CreditCard size={14} strokeWidth={1.8} />, label: 'My Wallet' },
  ];

  let navItems = clientNav;
  if (user?.role === 'admin') navItems = adminNav;
  if (user?.role === 'freelancer') navItems = freelancerNav;

  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      api.get('/messages/unread-count')
        .then(res => setUnreadCount(res.data.count))
        .catch(err => console.error(err));
    }
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: T.bg, fontFamily: 'Inter, sans-serif' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 208, flexShrink: 0,
        backgroundColor: T.sidebar,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: T.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                TrustGig
              </span>
              <span style={{
                display: 'block', fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1,
              }}>
                {user?.role === 'admin' ? 'Admin' : user?.role === 'freelancer' ? 'Freelancer' : 'Client'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav section label */}
        <div style={{ padding: '16px 16px 6px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            Menu
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '0 8px', flex: 1 }}>
          {navItems.map(item => {
            const isDashboard = item.path === '/dashboard' || item.path === '/admin';
            const isActive = isDashboard 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            const isMessages = item.path === '/inbox';
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 6, marginBottom: 2,
                  border: 'none', cursor: 'pointer', textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(55,47,140,0.55)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.52)',
                  transition: 'all 0.13s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {item.icon}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                </div>
                {isMessages && unreadCount > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, padding: '0 5px',
                    borderRadius: 99, backgroundColor: T.red,
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User strip */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#4E44B8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={13} color="rgba(255,255,255,0.80)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.80)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.email}
              </p>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: 'rgba(255,255,255,0.32)', margin: '1px 0 0', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
            <LogOut size={13} onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0, cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          height: 52, borderBottom: `1px solid ${T.border}`,
          backgroundColor: T.white,
          display: 'flex', alignItems: 'center', padding: '0 28px',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, textTransform: 'capitalize' }}>{user?.role}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted }}>/</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: T.ink }}>
              {title}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        <footer style={{ padding: '24px 28px', backgroundColor: T.white, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color={T.muted} strokeWidth={2.5} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.subtle }}>
              © {new Date().getFullYear()} TrustGig Pvt Ltd.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: T.muted }}>
            <span style={{ cursor: 'pointer' }}>Terms</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Contact</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
