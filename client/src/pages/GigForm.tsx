import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import { Btn } from '../components/ui/Btn';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { Briefcase, MapPin, Tag, Clock, DollarSign, AlignLeft, AlertTriangle } from 'lucide-react';

export default function GigForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    city: '',
    price: '',
    deliveryDays: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/gigs', {
        ...formData,
        price: Number(formData.price),
        deliveryDays: Number(formData.deliveryDays)
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    width: '100%', height: 40, padding: '0 16px 0 40px',
    borderRadius: 8, border: `1px solid ${T.border}`,
    fontSize: 14, fontFamily: 'Inter, sans-serif',
    color: T.ink, outline: 'none', boxSizing: 'border-box' as const
  };

  const labelStyles = { display: 'block', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 };
  const iconStyles = { position: 'absolute' as const, left: 14, top: 12, color: T.muted };

  return (
    <DashboardLayout title="Create a New Gig">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          backgroundColor: T.white, borderRadius: 16, padding: 32,
          border: `1px solid ${T.border}`, boxShadow: "0 2px 12px rgba(55,47,140,0.04)"
        }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 600, margin: "0 0 24px", color: T.ink }}>
            Gig Details
          </h2>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8,
              backgroundColor: T.redTint, border: `1px solid ${T.red}30`, marginBottom: 24
            }}>
              <AlertTriangle size={16} strokeWidth={2.5} style={{ color: T.red, flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: T.red, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyles}>Gig Title</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={iconStyles} />
                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                  placeholder="e.g. Professional Web Development" style={inputStyles}
                  onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyles}>Category</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={iconStyles} />
                  <select name="category" value={formData.category} onChange={handleChange} required style={inputStyles}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border}>
                    <option value="" disabled>Select category</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Design">Design</option>
                    <option value="Writing">Writing</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyles}>City</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={iconStyles} />
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required
                    placeholder="e.g. Lahore" style={inputStyles}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyles}>Price (Rs.)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={iconStyles} />
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="100"
                    placeholder="5000" style={inputStyles}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyles}>Delivery Time (Days)</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={16} style={iconStyles} />
                  <input type="number" name="deliveryDays" value={formData.deliveryDays} onChange={handleChange} required min="1"
                    placeholder="3" style={inputStyles}
                    onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyles}>Description</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={16} style={{ ...iconStyles, top: 14 }} />
                <textarea name="description" value={formData.description} onChange={handleChange} required
                  placeholder="Describe what you will deliver..."
                  style={{ ...inputStyles, height: 120, padding: '12px 16px 12px 40px', resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Btn type="submit" variant="indigo" size="lg" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Gig'}
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
