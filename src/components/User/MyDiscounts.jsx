import React, { useState, useEffect } from 'react';
import { CheckCircle, Percent, Clock, Calendar, AlertCircle, Loader, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const MyDiscounts = () => {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'requests'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load active discounts for this user
      const discountsData = await api.getPatientDiscounts(user.id, token);
      setDiscounts(discountsData || []);

      // Load discount requests
      const requestsData = await api.getDiscountRequests(token);
      // Filter only this user's requests
      const myRequests = (requestsData || []).filter(r => r.patientId === user.id);
      setRequests(myRequests);

    } catch (err) {
      console.error('Error loading discounts:', err);
      setError('Greška pri učitavanju podataka o popustima');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#fa8c16';
      case 'Approved': return '#52c41a';
      case 'Rejected': return '#ff4d4f';
      default: return '#8c8c8c';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'Na čekanju';
      case 'Approved': return 'Odobreno';
      case 'Rejected': return 'Odbijeno';
      default: return status;
    }
  };

  const isExpiringSoon = (validUntil) => {
    const daysUntilExpiry = Math.floor((new Date(validUntil) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite', margin: '2rem auto' }} />
        <p style={{ color: '#8c8c8c' }}>Učitavanje...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
          Moji popusti
        </h1>
        <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
          Pregled aktivnih popusta i zahteva za popust
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: '#fff2f0',
          color: '#cf1322',
          border: '1px solid #ffccc7',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '2px solid #1890ff' : '2px solid transparent',
            color: activeTab === 'active' ? '#1890ff' : '#8c8c8c',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          Aktivni popusti ({discounts.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid #1890ff' : '2px solid transparent',
            color: activeTab === 'requests' ? '#1890ff' : '#8c8c8c',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          Moji zahtevi ({requests.length})
        </button>
      </div>

      {/* Active Discounts Tab */}
      {activeTab === 'active' && (
        <div>
          {discounts.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Gift size={64} color="#d9d9d9" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#262626', marginBottom: '0.5rem' }}>Nemate aktivnih popusta</h3>
              <p style={{ color: '#8c8c8c' }}>
                Možete zatražiti dodatni popust pri zahtevanju nove usluge.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {discounts.map(discount => {
                const expiringSoon = isExpiringSoon(discount.validUntil);
                const daysRemaining = Math.floor((new Date(discount.validUntil) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={discount.id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: expiringSoon ? '2px solid #fa8c16' : '1px solid #f0f0f0'
                    }}
                  >
                    {expiringSoon && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#fff7e6',
                        color: '#fa8c16',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '1rem'
                      }}>
                        <Clock size={16} />
                        Ističe za {daysRemaining} dana
                      </div>
                    )}

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                          Procenat popusta
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '1.75rem',
                          fontWeight: 700,
                          color: '#52c41a'
                        }}>
                          <Percent size={28} />
                          {discount.discountPercent}%
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                          Maksimalan iznos
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1890ff' }}>
                          ${discount.maxDiscountAmount}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                          Važi od
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: 600,
                          color: '#262626'
                        }}>
                          <Calendar size={18} />
                          {new Date(discount.validFrom).toLocaleDateString('sr-RS')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                          Važi do
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: 600,
                          color: expiringSoon ? '#fa8c16' : '#262626'
                        }}>
                          <Calendar size={18} />
                          {new Date(discount.validUntil).toLocaleDateString('sr-RS')}
                        </div>
                      </div>
                    </div>

                    {discount.reason && (
                      <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: '#f6ffed',
                        borderRadius: '8px',
                        borderLeft: '3px solid #52c41a'
                      }}>
                        <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>
                          Razlog odobrenja
                        </div>
                        <div style={{ color: '#262626', fontWeight: 500 }}>
                          {discount.reason}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Clock size={64} color="#d9d9d9" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#262626', marginBottom: '0.5rem' }}>Nemate aktivnih zahteva</h3>
              <p style={{ color: '#8c8c8c' }}>
                Zatražite dodatni popust pri kreiranju novog zahteva za uslugu.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {requests.map(request => (
                <div
                  key={request.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>
                        Datum zahteva
                      </div>
                      <div style={{ fontWeight: 600, color: '#262626' }}>
                        {new Date(request.requestedAtUtc).toLocaleDateString('sr-RS')}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: `${getStatusColor(request.status)}20`,
                      color: getStatusColor(request.status)
                    }}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>
                        Razlog
                      </div>
                      <div style={{ fontWeight: 600, color: '#262626' }}>
                        {request.reason || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>
                        Traženi popust
                      </div>
                      <div style={{ fontWeight: 700, color: '#1890ff', fontSize: '1.25rem' }}>
                        {request.requestedDiscountPercent}%
                      </div>
                    </div>
                  </div>

                  {request.explanation && (
                    <div style={{
                      padding: '1rem',
                      background: '#fafafa',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                        Obrazloženje
                      </div>
                      <div style={{ color: '#262626', whiteSpace: 'pre-wrap' }}>
                        {request.explanation}
                      </div>
                    </div>
                  )}

                  {request.status === 'Rejected' && request.rejectionReason && (
                    <div style={{
                      padding: '1rem',
                      background: '#fff2f0',
                      borderRadius: '8px',
                      borderLeft: '3px solid #ff4d4f'
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                        Razlog odbijanja
                      </div>
                      <div style={{ color: '#cf1322', fontWeight: 500 }}>
                        {request.rejectionReason}
                      </div>
                    </div>
                  )}

                  {request.respondedAtUtc && (
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f0f0f0',
                      fontSize: '0.875rem',
                      color: '#8c8c8c'
                    }}>
                      Odgovoreno: {new Date(request.respondedAtUtc).toLocaleString('sr-RS')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MyDiscounts;