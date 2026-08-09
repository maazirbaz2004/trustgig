import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';

export default function DisputeForm() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return alert('Please provide a reason for the dispute.');

    setLoading(true);
    const formData = new FormData();
    formData.append('bookingId', bookingId || '');
    formData.append('reason', reason);
    if (evidence) {
      formData.append('evidence', evidence);
    }

    try {
      await api.post('/disputes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Dispute submitted successfully. Our team will review it shortly.');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Open a Dispute">
      <div style={{ maxWidth: 600, margin: '0 auto', backgroundColor: T.white, borderRadius: 12, border: `1px solid ${T.border}`, padding: 32 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: T.ink, margin: '0 0 8px' }}>Open a Dispute</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: '0 0 24px' }}>
          If you are unsatisfied with the delivered work, you can open a dispute. Please provide detailed reasons and evidence (screenshots or files) to support your claim. Our moderation team will review it.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
              Reason for Dispute <span style={{ color: T.red }}>*</span>
            </label>
            <textarea
              required
              rows={5}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain clearly why you are disputing the delivery..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8,
                border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 14, resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
              Evidence (Optional)
            </label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 32, border: `2px dashed ${T.border}`, borderRadius: 8, backgroundColor: T.bg,
              cursor: 'pointer', transition: 'border-color 0.2s'
            }}>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={e => e.target.files && setEvidence(e.target.files[0])} 
                style={{ display: 'none' }} 
              />
              {evidence ? (
                <>
                  <FileText size={32} color={T.indigo} style={{ marginBottom: 12 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.indigo, fontWeight: 600 }}>{evidence.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, marginTop: 4 }}>Click to replace</span>
                </>
              ) : (
                <>
                  <UploadCloud size={32} color={T.muted} style={{ marginBottom: 12 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.ink, fontWeight: 500 }}>Click to upload evidence</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, marginTop: 4 }}>PNG, JPG, PDF up to 5MB</span>
                </>
              )}
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: `1px solid ${T.border}`, backgroundColor: T.white, color: T.ink, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', backgroundColor: T.red, color: T.white, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Submitting Dispute...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
