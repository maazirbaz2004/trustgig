import React, { useEffect, useState } from 'react';
import { T } from '../../theme/tokens';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function AdminDeposits() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await api.get('/admin/deposits');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to approve this deposit? This will instantly credit the user's wallet with these funds.")) return;

    try {
      await api.put(`/admin/deposits/${requestId}/approve`);
      setRequests(requests.filter(r => r._id !== requestId));
      alert('Deposit approved and wallet credited.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve deposit');
    }
  };

  if (loading) {
    return <DashboardLayout title="Deposit Verifications"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Deposit Verifications">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: T.ink, margin: '0 0 8px' }}>Pending Deposits</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>Verify the uploaded receipt matches a real transaction in your Meezan Bank account.</p>
          </div>
        </div>
        
        {requests.length === 0 ? (
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>No pending deposit requests.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            {requests.map(request => (
              <div key={request._id} style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
                
                {/* Receipt Image */}
                <div style={{ width: 280, backgroundColor: T.bg, borderRight: `1px solid ${T.border}` }}>
                  <a href={request.receiptUrl} target="_blank" rel="noreferrer">
                    <img src={request.receiptUrl} alt="Transfer Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </a>
                </div>

                {/* Details */}
                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: T.indigoTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard color={T.indigo} size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>
                        {request.client?.name}
                      </h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: 0 }}>
                        {request.client?.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 4px' }}>Claimed Amount</p>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 24, fontWeight: 700, color: T.green }}>
                      Rs. {request.amount.toLocaleString()}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleApprove(request._id)}
                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: T.green, color: T.white, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
                    <CheckCircle size={16} /> Approve & Credit Wallet
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
