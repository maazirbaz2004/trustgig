import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Pill } from '../components/ui/Pill';

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gigs, setGigs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deliveryNotes, setDeliveryNotes] = useState<Record<string, string>>({});
  const [delivering, setDelivering] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gigsRes, bookingsRes] = await Promise.all([
          api.get(`/gigs?freelancer=${user?.id}`),
          api.get('/bookings')
        ]);
        setGigs(gigsRes.data);
        setBookings(bookingsRes.data.filter((b: any) => b.freelancer?._id === user?.id || b.freelancer === user?.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const handleDeliver = async (bookingId: string) => {
    if (!deliveryNotes[bookingId]) return alert('Please enter delivery notes before submitting.');
    setDelivering(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/deliver`, { deliveryNotes: deliveryNotes[bookingId] });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'delivered' } : b));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit delivery');
    } finally {
      setDelivering(null);
    }
  };

  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [uploadingCnic, setUploadingCnic] = useState(false);

  const handleUploadCnic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicFile) return;
    setUploadingCnic(true);
    try {
      // 1. Upload to Cloudinary unsigned
      const formData = new FormData();
      formData.append('file', cnicFile);
      formData.append('upload_preset', 'trustgig_uploads');
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Failed to upload image');
      
      const cnicUrl = uploadData.secure_url;

      // 2. Save URL to profile
      await api.post('/users/cnic', { cnicUrl });
      
      alert('CNIC uploaded successfully! Please wait for admin approval.');
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to upload CNIC');
    } finally {
      setUploadingCnic(false);
    }
  };

  if (loading) {
    return <DashboardLayout title="My Dashboard"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading dashboard...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="My Dashboard">
      {!user?.isVerified && (
        <div style={{ backgroundColor: T.redTint, border: `1px solid ${T.red}30`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.red, margin: '0 0 8px' }}>Action Required: KYC Verification</h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.red, margin: '0 0 16px', opacity: 0.8 }}>
            {user?.cnicImageUrl 
              ? "Your CNIC is currently under review by an Admin. You won't be able to create gigs until approved."
              : "Please upload a clear picture of your CNIC to verify your identity and start selling."}
          </p>
          
          {!user?.cnicImageUrl && (
            <form onSubmit={handleUploadCnic} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setCnicFile(e.target.files?.[0] || null)}
                required
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}
              />
              <button 
                type="submit"
                disabled={uploadingCnic || !cnicFile}
                style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: T.red, color: T.white, border: 'none', cursor: uploadingCnic ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, opacity: uploadingCnic || !cnicFile ? 0.7 : 1 }}>
                {uploadingCnic ? 'Uploading...' : 'Submit CNIC'}
              </button>
            </form>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 600, color: T.ink, margin: 0 }}>Overview</h2>
        <button 
          onClick={() => navigate('/gigs/new')}
          disabled={!user?.isVerified}
          style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 20px", borderRadius: 8, border: "none", cursor: user?.isVerified ? "pointer" : "not-allowed",
          backgroundColor: T.green, color: T.white,
          fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
          opacity: user?.isVerified ? 1 : 0.5
        }}>
          Create a Gig
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Active Gigs Section */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 16px' }}>My Active Gigs</h3>
          {gigs.length === 0 ? (
            <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>You don't have any active gigs yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {gigs.map(gig => (
                <div key={gig._id} style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                  <Pill cfg={{ label: gig.category, bg: T.indigoTint, color: T.indigo }} />
                  <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: T.ink, margin: '12px 0 8px' }}>{gig.title}</h4>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 700, color: T.indigo, margin: 0 }}>Rs. {gig.price?.toLocaleString() || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Bookings Section */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 16px' }}>My Bookings</h3>
          {bookings.length === 0 ? (
            <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.muted, margin: 0 }}>You don't have any active bookings.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {bookings.map((booking, idx) => (
                <div key={booking._id} style={{ padding: 16, borderBottom: idx === bookings.length - 1 ? 'none' : `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>{booking.gig?.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted }}>Client: {booking.client?.name}</span>
                        <Pill cfg={{ label: booking.status, bg: booking.status === 'funded' ? T.indigoTint : booking.status === 'completed' ? T.greenTint : T.bg, color: booking.status === 'funded' ? T.indigo : booking.status === 'completed' ? T.green : T.ink }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 700, color: T.ink }}>Rs. {booking.amount?.toLocaleString() || 0}</span>
                  </div>
                  
                  {booking.status === 'funded' && (
                    <div style={{ backgroundColor: T.bg, padding: 16, borderRadius: 8, marginTop: 8 }}>
                      <textarea 
                        value={deliveryNotes[booking._id] || ''}
                        onChange={e => setDeliveryNotes({ ...deliveryNotes, [booking._id]: e.target.value })}
                        placeholder="Provide a link to your final files or explain the delivery..."
                        style={{ width: '100%', height: 60, padding: 12, borderRadius: 6, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
                      />
                      <button 
                        onClick={() => handleDeliver(booking._id)}
                        disabled={delivering === booking._id}
                        style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: T.indigo, color: T.white, border: 'none', cursor: delivering === booking._id ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, opacity: delivering === booking._id ? 0.7 : 1 }}>
                        {delivering === booking._id ? 'Submitting...' : 'Deliver Work'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
