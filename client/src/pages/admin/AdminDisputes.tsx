import React, { useEffect, useState } from 'react';
import { T } from '../../theme/tokens';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Scale, Download } from 'lucide-react';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string, action: 'release' | 'refund') => {
    if (!resolutionNotes[disputeId]) return alert('Please enter resolution notes before proceeding.');
    if (!window.confirm(`Are you sure you want to ${action === 'release' ? 'release funds to the freelancer' : 'refund the client'}?`)) return;

    try {
      await api.put(`/admin/disputes/${disputeId}/resolve`, {
        action,
        resolutionNotes: resolutionNotes[disputeId]
      });
      setDisputes(disputes.filter(d => d._id !== disputeId));
      alert(`Dispute resolved and funds ${action}ed successfully.`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  if (loading) {
    return <DashboardLayout title="Dispute Management"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Dispute Management">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: T.ink, marginBottom: 24 }}>Open Disputes</h2>
        
        {disputes.length === 0 ? (
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>No open disputes. Great job!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            {disputes.map(dispute => (
              <div key={dispute._id} style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Scale size={18} color={T.indigo} />
                    <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: T.ink, margin: 0 }}>
                      Booking #{dispute.booking?._id.slice(-6).toUpperCase()}
                    </h3>
                  </div>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 15, fontWeight: 700, color: T.red }}>
                    Escrow: Rs. {dispute.booking?.amount?.toLocaleString()}
                  </span>
                </div>
                
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderBottom: `1px solid ${T.border}` }}>
                  {/* Client Side */}
                  <div>
                    <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Client's Claim</h4>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>{dispute.booking?.client?.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.ink, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{dispute.reason}</p>
                    {dispute.evidenceUrl && (
                      <a href={dispute.evidenceUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.indigo, textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500 }}>
                        <Download size={14} /> View Evidence
                      </a>
                    )}
                  </div>
                  
                  {/* Freelancer Side */}
                  <div style={{ paddingLeft: 24, borderLeft: `1px solid ${T.border}` }}>
                    <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Freelancer's Delivery</h4>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>{dispute.booking?.freelancer?.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.ink, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{dispute.booking?.deliveryNotes}</p>
                  </div>
                </div>
                
                <div style={{ padding: 24, backgroundColor: T.bg }}>
                  <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Resolution Panel</h4>
                  <textarea 
                    placeholder="Write your final decision notes here..."
                    value={resolutionNotes[dispute._id] || ''}
                    onChange={e => setResolutionNotes({ ...resolutionNotes, [dispute._id]: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}
                    rows={3}
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      onClick={() => handleResolve(dispute._id, 'refund')}
                      style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', backgroundColor: T.red, color: T.white, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
                      Refund Client
                    </button>
                    <button 
                      onClick={() => handleResolve(dispute._id, 'release')}
                      style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', backgroundColor: T.green, color: T.white, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
                      Release to Freelancer
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
