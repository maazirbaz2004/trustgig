import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { MapPin, Star, User as UserIcon, Plus } from 'lucide-react';
import { Pill } from '../components/ui/Pill';
import { useAuth } from '../context/AuthContext';
import { Btn } from '../components/ui/Btn';

export default function MyGigs() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyGigs = async () => {
      if (!user) return;
      try {
        const res = await api.get('/gigs', { params: { freelancer: user.id } });
        setGigs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyGigs();
  }, [user]);

  return (
    <DashboardLayout title="My Gigs">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: T.ink, margin: 0 }}>
            Manage Your Gigs
          </h2>
          <Btn 
            variant="indigo"
            onClick={() => navigate('/gigs/new')}
          >
            <Plus size={16} /> Create New Gig
          </Btn>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontFamily: 'Inter, sans-serif' }}>
            Loading gigs...
          </div>
        ) : gigs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontFamily: 'Inter, sans-serif', backgroundColor: T.white, borderRadius: 12, border: `1px solid ${T.border}` }}>
            You haven't created any gigs yet. Click "Create New Gig" to get started!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {gigs.map(gig => (
              <Link key={gig._id} to={`/gigs/${gig._id}`} style={{ textDecoration: 'none' }}>
                <div 
                  style={{
                    backgroundColor: T.white, borderRadius: 12, border: `1px solid ${T.border}`,
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)", transition: "transform 0.2s, box-shadow 0.2s",
                    height: '100%'
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-3px)';
                    el.style.boxShadow = "0 8px 24px rgba(55,47,140,0.12)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                  }}
                >
                  {/* Card Header (Placeholder image) */}
                  <div style={{ height: 140, backgroundColor: T.indigoTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40 }}>{gig.category === 'Plumbing' ? '🔧' : gig.category === 'Electrician' ? '⚡' : gig.category === 'Design' ? '🎨' : gig.category === 'Writing' ? '📝' : '💻'}</span>
                  </div>

                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <Pill cfg={{ label: gig.category, bg: T.bg, color: T.ink }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={14} fill={T.amber} color={T.amber} />
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 700, color: T.ink }}>
                          {gig.freelancer?.avgRating?.toFixed(1) || 'New'}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 8px', lineHeight: 1.3 }}>
                      {gig.title}
                    </h3>
                    
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {gig.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px solid ${T.border}`, margin: '0 -20px', padding: '16px 20px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.muted }}>
                        <MapPin size={14} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>{gig.city}</span>
                      </div>
                      <div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, display: 'block', textAlign: 'right' }}>PRICE</span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 700, color: T.indigo }}>
                          Rs. {gig.price?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
