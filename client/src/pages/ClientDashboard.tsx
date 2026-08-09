import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function BoxStampIllustration() {
  const W = 220, H = 180;
  const bx = 60, by = 96, bw = 100, bh = 64;
  const mid = bx + bw / 2;
  const sc = { x: 162, y: 44, r: 26 };

  function stampTeeth(cx: number, cy: number, R: number, n: number, depth: number) {
    const pts: string[] = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? R : R - depth;
      pts.push(`${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ") + " Z";
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-label="Empty open box with stamp">
      <path d={`M ${bx},${by} L ${bx - 18},${by - 14} L ${bx - 18},${by + bh - 10} L ${bx},${by + bh} Z`} stroke={T.indigo} strokeWidth="1.5" strokeLinejoin="round" fill={T.paper} />
      <rect x={bx} y={by} width={bw} height={bh} rx="1" stroke={T.indigo} strokeWidth="1.5" fill={T.white} />
      <line x1={mid} y1={by} x2={mid} y2={by + bh} stroke={T.indigo} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      <line x1={bx} y1={by + bh * 0.42} x2={bx + bw} y2={by + bh * 0.42} stroke={T.indigo} strokeWidth="1" opacity="0.18" />
      <path d={`M ${bx},${by} L ${bx - 8},${by - 26} L ${mid - 5},${by - 26} L ${mid},${by} Z`} stroke={T.indigo} strokeWidth="1.5" strokeLinejoin="round" fill={T.paper} />
      <path d={`M ${mid},${by} L ${mid + 5},${by - 26} L ${bx + bw + 8},${by - 26} L ${bx + bw},${by} Z`} stroke={T.indigo} strokeWidth="1.5" strokeLinejoin="round" fill={T.paper} />
      <line x1={bx} y1={by} x2={bx + bw} y2={by} stroke={T.indigo} strokeWidth="1" opacity="0.5" />
      <line x1={bx + 6} y1={by + 6} x2={bx + bw - 6} y2={by + 6} stroke={T.indigo} strokeWidth="0.8" opacity="0.15" />
      <line x1={bx + 6} y1={by + 6} x2={bx + 6} y2={by + bh - 8} stroke={T.indigo} strokeWidth="0.8" opacity="0.15" />
      <ellipse cx={bx + bw / 2 - 6} cy={by + bh + 10} rx={48} ry={5} fill={T.indigo} opacity="0.07" />
      <g transform={`rotate(-14, ${sc.x}, ${sc.y})`}>
        <path d={stampTeeth(sc.x, sc.y, sc.r, 16, 2.8)} fill={T.redTint} stroke={T.red} strokeWidth="1.2" />
        <circle cx={sc.x} cy={sc.y} r={sc.r * 0.72} fill="none" stroke={T.red} strokeWidth="0.9" opacity="0.40" />
        <path d={`M ${sc.x},${sc.y - 9} L ${sc.x + 7},${sc.y - 5} L ${sc.x + 7},${sc.y + 2} Q ${sc.x + 7},${sc.y + 9} ${sc.x},${sc.y + 11} Q ${sc.x - 7},${sc.y + 9} ${sc.x - 7},${sc.y + 2} L ${sc.x - 7},${sc.y - 5} Z`} fill="none" stroke={T.red} strokeWidth="1.4" strokeLinejoin="round" />
        <polyline points={`${sc.x - 3},${sc.y + 1} ${sc.x},${sc.y + 4} ${sc.x + 4},${sc.y - 2}`} fill="none" stroke={T.red} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {[-8, 0, 8].map((dx, i) => (
        <line key={i} x1={sc.x + dx - 4 + i * 2} y1={sc.y - sc.r - 6} x2={sc.x + dx - 4 + i * 2} y2={sc.y - sc.r - 13} stroke={T.red} strokeWidth="1.2" strokeLinecap="round" opacity={0.4 - i * 0.1} />
      ))}
      {[[mid - 14, by + 32],[mid + 12, by + 42],[mid - 4, by + 22]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill={T.indigo} opacity="0.18" />
      ))}
    </svg>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.filter((b: any) => b.client?._id === user?.id || b.client === user?.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchBookings();
  }, [user]);

  const handleApprove = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to approve this work and release the funds?")) return;
    setActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/approve`);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'completed' } : b));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSubmit = async (bookingId: string) => {
    if (!reviewData.comment) return alert('Please enter a review comment.');
    setActionLoading(`review-${bookingId}`);
    try {
      await api.post('/reviews', { bookingId, ...reviewData });
      alert('Review submitted successfully!');
      setReviewing(null);
      // We don't change booking status here, just clear the review form. 
      // Ideally we'd mark it as reviewed in the state to hide the button.
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, hasReviewed: true } : b));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <DashboardLayout title="My Bookings"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading dashboard...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="My Bookings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 600, color: T.ink, margin: 0 }}>Overview</h2>
        <button 
          onClick={() => navigate('/gigs')}
          style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 20px", borderRadius: 8, border: "none", cursor: "pointer",
          backgroundColor: T.indigo, color: T.white,
          fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
        }}>
          Explore Gigs
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Active Bookings Section */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 16px' }}>My Bookings</h3>
          {bookings.length === 0 ? (
            <div style={{
              backgroundColor: T.white, borderRadius: 16, border: `1px solid rgba(55,47,140,0.10)`,
              boxShadow: "0 4px 28px rgba(55,47,140,0.09), 0 1px 6px rgba(55,47,140,0.05)",
              padding: "52px 56px 48px", maxWidth: 400, width: "100%", margin: '0 auto',
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            }}>
              <div style={{ marginBottom: 28 }}>
                <BoxStampIllustration />
              </div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 600, color: T.ink, margin: "0 0 10px", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                Welcome to your Dashboard
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: T.muted, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 260 }}>
                You haven't booked any gigs yet. Start exploring to find top freelancers!
              </p>
              <button onClick={() => navigate('/gigs')} style={{
                display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 28px", borderRadius: 10,
                border: "none", cursor: "pointer", backgroundColor: T.indigo, color: T.white,
                fontFamily: "Inter, sans-serif", fontSize: 14.5, fontWeight: 700, letterSpacing: "0.01em",
                boxShadow: "0 2px 10px rgba(55,47,140,0.28)", transition: "background 0.15s, box-shadow 0.15s",
              }}>
                <LayoutGrid size={15} strokeWidth={2.5} />
                Explore Gigs
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {bookings.map((booking, idx) => (
                <div key={booking._id} style={{ padding: 16, borderBottom: idx === bookings.length - 1 ? 'none' : `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: T.ink, margin: '0 0 6px' }}>{booking.gig?.title}</h4>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 8px' }}>Freelancer: {booking.freelancer?.name}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                          backgroundColor: booking.status === 'funded' ? T.bg : booking.status === 'delivered' ? T.indigoTint : booking.status === 'completed' ? T.greenTint : T.redTint,
                          color: booking.status === 'funded' ? T.muted : booking.status === 'delivered' ? T.indigo : booking.status === 'completed' ? T.green : T.red
                        }}>
                          {booking.status.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 700, color: T.ink }}>Rs. {booking.amount?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {booking.status === 'delivered' && (
                        <>
                          <button 
                            onClick={() => navigate(`/disputes/new/${booking._id}`)}
                            style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: T.white, color: T.red, border: `1px solid ${T.red}`, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                            Dispute
                          </button>
                          <button 
                            onClick={() => handleApprove(booking._id)}
                            disabled={actionLoading === booking._id}
                            style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: T.green, color: T.white, border: 'none', cursor: actionLoading === booking._id ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                            {actionLoading === booking._id ? 'Processing...' : 'Approve & Pay'}
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && !booking.hasReviewed && (
                        <button 
                          onClick={() => setReviewing(reviewing === booking._id ? null : booking._id)}
                          style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: T.indigoTint, color: T.indigo, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                          {reviewing === booking._id ? 'Cancel Review' : 'Leave a Review'}
                        </button>
                      )}
                    </div>
                  </div>

                  {booking.status === 'delivered' && booking.deliveryNotes && (
                    <div style={{ backgroundColor: T.bg, padding: 12, borderRadius: 6, border: `1px solid ${T.border}` }}>
                      <h5 style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>Delivery Notes</h5>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: 0, whiteSpace: 'pre-wrap' }}>{booking.deliveryNotes}</p>
                    </div>
                  )}

                  {reviewing === booking._id && (
                    <div style={{ backgroundColor: T.bg, padding: 16, borderRadius: 8, border: `1px solid ${T.border}` }}>
                      <h5 style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, margin: '0 0 12px' }}>Leave a Review</h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Rating:</span>
                        <select 
                          value={reviewData.rating} 
                          onChange={e => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                          style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${T.border}` }}>
                          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                      </div>
                      <textarea 
                        value={reviewData.comment}
                        onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                        placeholder="Write your review here..."
                        style={{ width: '100%', height: 60, padding: 12, borderRadius: 6, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
                      />
                      <button 
                        onClick={() => handleReviewSubmit(booking._id)}
                        disabled={actionLoading === `review-${booking._id}`}
                        style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: T.indigo, color: T.white, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                        {actionLoading === `review-${booking._id}` ? 'Submitting...' : 'Submit Review'}
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
