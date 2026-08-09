import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Download, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle } from 'lucide-react';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [depositAmount, setDepositAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/wallet');
      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
      setWithdrawalRequests(res.data.withdrawalRequests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(depositAmount);
    if (!amount || amount < 500) return alert('Minimum deposit is Rs. 500');
    if (!receiptFile) return alert('Please upload a screenshot of your transaction receipt.');

    setActionLoading(true);
    try {
      // 1. Upload receipt to Cloudinary
      const formData = new FormData();
      formData.append('file', receiptFile);
      formData.append('upload_preset', 'trustgig_uploads');
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Failed to upload receipt');
      
      const receiptUrl = uploadData.secure_url;

      // 2. Submit Deposit Request
      await api.post('/wallet/deposit', { amount, receiptUrl });
      alert('Deposit request submitted! An admin will verify your receipt and credit your wallet shortly.');
      setDepositAmount('');
      setReceiptFile(null);
      fetchWalletData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to submit deposit request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 1000) return alert('Minimum withdrawal is Rs. 1000');
    if (!bankDetails) return alert('Please enter bank details');

    setActionLoading(true);
    try {
      await api.post('/wallet/withdraw', { amount, bankDetails });
      alert('Withdrawal request submitted successfully! Admin will process it shortly.');
      setWithdrawAmount('');
      setBankDetails('');
      fetchWalletData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <DashboardLayout title="My Wallet"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading wallet...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="My Wallet">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32, alignItems: 'start' }}>
        
        {/* Left Column: History */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: T.ink, margin: '0 0 20px' }}>Transaction History</h3>
          
          {transactions.length === 0 ? (
            <div style={{ padding: 40, backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, textAlign: 'center', color: T.muted, fontFamily: 'Inter, sans-serif' }}>
              No transactions yet.
            </div>
          ) : (
            <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {transactions.map((tx, idx) => (
                <div key={tx._id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', borderBottom: idx === transactions.length - 1 ? 'none' : `1px solid ${T.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: tx.type === 'credit' ? T.greenTint : T.redTint,
                      color: tx.type === 'credit' ? T.green : T.red
                    }}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>
                        {tx.description}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, margin: 0 }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 15, fontWeight: 700, 
                    color: tx.type === 'credit' ? T.green : T.red 
                  }}>
                    {tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          )}

          {user?.role === 'freelancer' && withdrawalRequests.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: T.ink, margin: '0 0 20px' }}>Withdrawal Requests</h3>
              <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {withdrawalRequests.map((wr, idx) => (
                  <div key={wr._id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '16px 20px', borderBottom: idx === withdrawalRequests.length - 1 ? 'none' : `1px solid ${T.border}`
                  }}>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>
                        Bank Transfer
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, margin: 0 }}>
                        {new Date(wr.createdAt).toLocaleDateString()} · {wr.bankDetails}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ 
                        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 4,
                        backgroundColor: wr.status === 'completed' ? T.greenTint : wr.status === 'rejected' ? T.redTint : T.indigoTint,
                        color: wr.status === 'completed' ? T.green : wr.status === 'rejected' ? T.red : T.indigo
                      }}>
                        {wr.status.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 15, fontWeight: 700, color: T.ink }}>
                        Rs. {wr.amount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Balance & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Balance Card */}
          <div style={{ 
            backgroundColor: T.indigo, borderRadius: 16, padding: 24, color: T.white,
            boxShadow: '0 12px 24px rgba(55,47,140,0.2)'
          }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 8px' }}>Available Balance</p>
            <h2 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 36, fontWeight: 700, margin: 0 }}>
              Rs. {balance?.toLocaleString() || 0}
            </h2>
          </div>

          {/* Action Card (Depends on Role) */}
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
            {user?.role === 'client' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <CreditCard color={T.indigo} size={24} />
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>Deposit Funds</h3>
                </div>
                
                <div style={{ backgroundColor: T.bg, padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.ink, margin: '0 0 8px' }}>Platform Bank Details</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 4px' }}>Bank: <strong>Meezan Bank</strong></p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 4px' }}>Title: <strong>TrustGig Pvt Ltd</strong></p>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, color: T.indigo, fontWeight: 600, margin: 0 }}>0123-456789-0123</p>
                </div>

                <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input 
                    type="number" 
                    placeholder="Amount Transferred (Rs.)" 
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    required
                    min="500"
                    style={{ padding: 12, borderRadius: 8, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 14 }}
                  />
                  <div style={{ border: `1px dashed ${T.border}`, padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, margin: '0 0 8px' }}>Upload Transaction Receipt</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                      required
                      style={{ fontSize: 12 }}
                    />
                  </div>
                  <button 
                    disabled={actionLoading}
                    style={{ 
                      padding: 12, borderRadius: 8, backgroundColor: T.indigo, color: T.white, border: 'none', cursor: actionLoading ? 'default' : 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, opacity: actionLoading ? 0.7 : 1
                    }}>
                    {actionLoading ? 'Uploading...' : 'Submit for Verification'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Download color={T.indigo} size={24} />
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>Withdraw Earnings</h3>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.muted, margin: '0 0 16px' }}>
                  Request a withdrawal to your bank account or mobile wallet.
                </p>
                <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input 
                    type="number" 
                    placeholder="Amount (Rs.)" 
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    required
                    min="1000"
                    max={balance}
                    style={{ padding: 12, borderRadius: 8, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 14 }}
                  />
                  <input 
                    type="text" 
                    placeholder="Bank Name & IBAN / Mobile Wallet No." 
                    value={bankDetails}
                    onChange={e => setBankDetails(e.target.value)}
                    required
                    style={{ padding: 12, borderRadius: 8, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 14 }}
                  />
                  <button 
                    disabled={actionLoading}
                    style={{ 
                      padding: 12, borderRadius: 8, backgroundColor: T.green, color: T.white, border: 'none', cursor: actionLoading ? 'default' : 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, opacity: actionLoading ? 0.7 : 1
                    }}>
                    {actionLoading ? 'Submitting...' : 'Request Withdrawal'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
