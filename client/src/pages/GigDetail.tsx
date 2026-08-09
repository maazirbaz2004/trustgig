import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { MapPin, Star, User as UserIcon, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Btn } from '../components/ui/Btn';
import { Pill } from '../components/ui/Pill';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await api.get(`/gigs/${id}`);
        setGig(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load gig');
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  const handleBook = async () => {
    if (!gig) return;
    setBookingLoading(true);
    setError('');
    try {
      await api.post('/bookings', { gigId: gig._id });
      navigate('/dashboard'); // redirect to client dashboard to see active booking
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book gig. Please make sure you have sufficient funds.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Gig Details"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading gig...</div></DashboardLayout>;
  if (!gig) return <DashboardLayout title="Gig Details"><div style={{ padding: 40, textAlign: 'center', color: T.red }}>{error || 'Gig not found'}</div></DashboardLayout>;

  return (
    <DashboardLayout title={gig.title}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: T.white, borderRadius: 16, border: `1px solid ${T.border}`,
            padding: 32, boxShadow: "0 2px 12px rgba(55,47,140,0.04)", marginBottom: 24
          }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Pill cfg={{ label: gig.category, bg: T.indigoTint, color: T.indigo }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted }}>
                <MapPin size={14} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{gig.city}</span>
              </div>
            </div>

            <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 600, color: T.ink, margin: "0 0 20px" }}>
              {gig.title}
            </h1>

            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', fontSize: 15, color: T.ink, lineHeight: 1.6 }}>
              {gig.description}
            </div>
          </div>

          {/* Freelancer Info */}
          <div style={{
            backgroundColor: T.white, borderRadius: 16, border: `1px solid ${T.border}`,
            padding: 32, boxShadow: "0 2px 12px rgba(55,47,140,0.04)"
          }}>
            <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 600, color: T.ink, margin: "0 0 20px" }}>About the Freelancer</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={32} color={T.muted} />
              </div>
              <div>
                <h4 style={{ fontFamily: "Inter, sans-serif", fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 4px" }}>
                  {gig.freelancer?.name}
                  {gig.freelancer?.isVerified && <span style={{ marginLeft: 8, fontSize: 12, color: T.green, backgroundColor: T.greenTint, padding: '2px 6px', borderRadius: 4 }}>Verified</span>}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={16} fill={T.amber} color={T.amber} />
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 700, color: T.ink }}>
                    {gig.freelancer?.avgRating?.toFixed(1) || 'No ratings yet'}
                  </span>
                </div>
                
                <button 
                  onClick={() => navigate('/inbox', { state: { freelancer: gig.freelancer } })}
                  style={{ marginTop: 12, padding: '8px 16px', borderRadius: 6, backgroundColor: T.indigoTint, color: T.indigo, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                  Chat with {gig.freelancer?.name.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Checkout Card */}
        <div style={{
          width: 320, flexShrink: 0,
          backgroundColor: T.white, borderRadius: 16, border: `1px solid ${T.border}`,
          padding: 24, boxShadow: "0 4px 20px rgba(55,47,140,0.08)",
          position: 'sticky', top: 80
        }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 8, backgroundColor: T.redTint, border: `1px solid ${T.red}30`, marginBottom: 20 }}>
              <AlertTriangle size={16} strokeWidth={2.5} style={{ color: T.red, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 500, color: T.red, margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink }}>Total Price</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 24, fontWeight: 700, color: T.indigo }}>Rs. {gig.price?.toLocaleString() || 0}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: T.muted }}>
            <Clock size={16} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
              <strong style={{ color: T.ink }}>{gig.deliveryDays} Days</strong> Delivery Time
            </span>
          </div>

          <Btn variant="indigo" size="lg" onClick={handleBook} disabled={bookingLoading} style={{ width: '100%', height: 48, fontSize: 15 }}>
            {bookingLoading ? 'Processing...' : 'Book Now'}
            {!bookingLoading && <ArrowRight size={18} strokeWidth={2} />}
          </Btn>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, textAlign: 'center', margin: '16px 0 0' }}>
            Payment is held securely in escrow until you approve the delivered work.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
