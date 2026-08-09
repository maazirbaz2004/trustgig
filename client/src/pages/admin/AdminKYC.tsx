import React, { useEffect, useState } from 'react';
import { T } from '../../theme/tokens';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Check, X } from 'lucide-react';

export default function AdminKYC() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const res = await api.get('/admin/pending-verifications');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      await api.put(`/admin/verify/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert('User verified successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to verify user');
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm("Are you sure you want to reject this KYC document? They will be asked to re-upload.")) return;
    try {
      await api.put(`/admin/reject/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert('KYC document rejected.');
    } catch (err) {
      console.error(err);
      alert('Failed to reject KYC');
    }
  };

  if (loading) {
    return <DashboardLayout title="KYC Review"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="KYC Review">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: T.ink, marginBottom: 24 }}>Pending KYC Approvals</h2>
        
        {users.length === 0 ? (
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>No pending verifications at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {users.map(user => (
              <div key={user._id} style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: 300, backgroundColor: T.bg, borderRight: `1px solid ${T.border}` }}>
                  <img src={user.cnicImageUrl} alt="CNIC Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: T.ink, margin: '0 0 8px' }}>{user.name}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 4px' }}>Email: {user.email}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 24px' }}>Phone: {user.phone}</p>
                  
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      onClick={() => handleVerify(user._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: T.green, color: T.white, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(user._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: `1px solid ${T.red}`, backgroundColor: T.white, color: T.red, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
                      <X size={16} /> Reject Image
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
