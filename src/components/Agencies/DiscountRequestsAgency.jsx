import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Loader, FileText } from 'lucide-react';
import { api } from '../../services/api';

const DiscountRequestsAgency = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await api.getDiscountRequests(token);
      // Filter requests for this agency
      setRequests(data || []);
    } catch (err) {
      console.error('Error loading discount requests:', err);
      setError('Greška pri učitavanju zahteva za popust');
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

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite', margin: '2rem auto' }} />
        <p style={{ color: '#8c8c8c' }}>Učitavanje zahteva...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
          Zahtevi za dodatni popust
        </h1>
        <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
          Pregled svih zahteva za dodatne popuste od pacijenata
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

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #fa8c16'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>Na čekanju</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fa8c16' }}>
            {requests.filter(r => r.status === 'Pending').length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #52c41a'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>Odobreno</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#52c41a' }}>
            {requests.filter(r => r.status === 'Approved').length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #ff4d4f'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>Odbijeno</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff4d4f' }}>
            {requests.filter(r => r.status === 'Rejected').length}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <FileText size={64} color="#d9d9d9" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#262626', marginBottom: '0.5rem' }}>Nema zahteva</h3>
          <p style={{ color: '#8c8c8c' }}>Trenutno nema zahteva za dodatne popuste.</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>Datum</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>Pacijent ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>Razlog</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>Traženi %</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#262626' }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id} style={{
                  borderBottom: index < requests.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background 0.2s'
                }}>
                  <td style={{ padding: '1rem', color: '#595959' }}>
                    {new Date(request.requestedAtUtc).toLocaleDateString('sr-RS')}
                  </td>
                  <td style={{ padding: '1rem', color: '#595959', fontFamily: 'monospace' }}>
                    {request.patientId.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '1rem', color: '#595959' }}>
                    {request.reason || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#1890ff' }}>
                    {request.requestedDiscountPercent}%
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      background: `${getStatusColor(request.status)}20`,
                      color: getStatusColor(request.status)
                    }}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewDetails(request)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      <Eye size={16} />
                      Detalji
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for details */}
      {showModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#262626' }}>
              Detalji zahteva
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Pacijent ID</div>
                  <div style={{ fontWeight: 600, color: '#262626', fontFamily: 'monospace' }}>
                    {selectedRequest.patientId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Datum zahteva</div>
                  <div style={{ fontWeight: 600, color: '#262626' }}>
                    {new Date(selectedRequest.requestedAtUtc).toLocaleString('sr-RS')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Razlog</div>
                  <div style={{ fontWeight: 600, color: '#262626' }}>
                    {selectedRequest.reason || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Traženi popust</div>
                  <div style={{ fontWeight: 700, color: '#1890ff', fontSize: '1.25rem' }}>
                    {selectedRequest.requestedDiscountPercent}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Obrazloženje</div>
                  <div style={{
                    padding: '1rem',
                    background: '#fafafa',
                    borderRadius: '8px',
                    color: '#262626',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedRequest.explanation || 'Nema obrazloženja'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Status</div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: `${getStatusColor(selectedRequest.status)}20`,
                    color: getStatusColor(selectedRequest.status)
                  }}>
                    {getStatusText(selectedRequest.status)}
                  </span>
                </div>

                {selectedRequest.respondedAtUtc && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>
                      Datum odgovora
                    </div>
                    <div style={{ fontWeight: 600, color: '#262626' }}>
                      {new Date(selectedRequest.respondedAtUtc).toLocaleString('sr-RS')}
                    </div>
                  </div>
                )}

                {selectedRequest.rejectionReason && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>
                      Razlog odbijanja
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: '#fff2f0',
                      borderRadius: '8px',
                      color: '#cf1322'
                    }}>
                      {selectedRequest.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={closeModal}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Zatvori
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        table tr:hover {
          background: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default DiscountRequestsAgency;