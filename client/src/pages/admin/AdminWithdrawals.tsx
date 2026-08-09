import React, { useEffect, useState } from 'react';
import { T } from '../../theme/tokens';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (requestId: string) => {
    if (!window.confirm("Are you sure you have manually transferred the funds to this freelancer's bank account?")) return;

    try {
      await api.put(`/admin/withdrawals/${requestId}/complete`);
      setRequests(requests.filter(r => r._id !== requestId));
      alert('Withdrawal marked as completed.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to complete withdrawal');
    }
  };

  if (loading) {
    return <DashboardLayout title="Withdrawal Requests"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Withdrawal Requests">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: T.ink, margin: '0 0 8px' }}>Pending Payouts</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>Transfer funds manually to the freelancer's bank, then mark as Paid.</p>
          </div>
        </div>
        
        {requests.length === 0 ? (
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>No pending withdrawal requests.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {requests.map(request => (
              <div key={request._id} style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: T.indigoTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard color={T.indigo} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>
                      {request.freelancer?.name}
                    </h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 4px' }}>
                      Email: {request.freelancer?.email} · Phone: {request.freelancer?.phone || 'N/A'}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: T.ink, margin: 0 }}>
                      Bank: {request.bankDetails}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 700, color: T.red }}>
                    Rs. {request.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleComplete(request._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: T.green, color: T.white, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
                    <CheckCircle size={16} /> Mark as Paid
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
