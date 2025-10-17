import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const DiscountRequestsHospital = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
  const [processing, setProcessing] = useState(false);
  const [approvedPercent, setApprovedPercent] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Current user role:', user?.role);
    if (user?.role !== 'HospitalAdmin') {
      setError('Nemate dozvolu za pristup ovoj stranici. Potrebna je uloga HospitalAdmin.');
    } else {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await api.getDiscountRequests(token);
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

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setModalType('approve');
    setApprovedPercent(request.requestedDiscountPercent.toString());
    setMaxDiscountAmount('');
    setShowModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setModalType('reject');
    setRejectionReason('');
    setShowModal(true);
  };

  const submitApproval = async () => {
    if (!approvedPercent || !maxDiscountAmount) {
      setError('Morate uneti procenat i maksimalni iznos popusta');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('Approving request:', selectedRequest.id);
      console.log('With data:', { approvedPercent, maxDiscountAmount });
      
      await api.approveDiscountRequest(selectedRequest.id, {
        approvedDiscountPercent: parseFloat(approvedPercent),
        maxDiscountAmount: parseFloat(maxDiscountAmount)
      }, token);

      setSuccess('Zahtev je uspešno odobren!');
      closeModal();
      loadRequests();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err.message || 'Greška pri odobravanju zahteva');
    } finally {
      setProcessing(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason) {
      setError('Morate uneti razlog odbijanja');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await api.rejectDiscountRequest(selectedRequest.id, {
        rejectionReason
      }, token);

      setSuccess('Zahtev je uspešno odbijen!');
      closeModal();
      loadRequests();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(err.message || 'Greška pri odbijanju zahteva');
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setModalType('');
    setApprovedPercent('');
    setMaxDiscountAmount('');
    setRejectionReason('');
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
          Zahtevi za popust - Administracija
        </h1>
        <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
          Odobrite ili odbijte zahteve za dodatne popuste
        </p>
      </div>

      {success && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: '#f6ffed',
          color: '#52c41a',
          border: '1px solid #b7eb8f',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #fa8c16'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
            Zahtevi na čekanju
          </div>
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
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
            Odobreno
          </div>
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
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
            Odbijeno
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff4d4f' }}>
            {requests.filter(r => r.status === 'Rejected').length}
          </div>
        </div>
      </div>

      {/* Requests Table */}
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
          <p style={{ color: '#8c8c8c' }}>Trenutno nema zahteva za popuste.</p>
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Datum
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Pacijent
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Razlog
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Obrazloženje
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Traženi %
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#262626' }}>
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id} style={{
                  borderBottom: index < requests.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <td style={{ padding: '1rem', color: '#595959' }}>
                    {new Date(request.requestedAtUtc).toLocaleDateString('sr-RS')}
                  </td>
                  <td style={{ padding: '1rem', color: '#595959', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {request.patientId.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '1rem', color: '#595959' }}>
                    {request.reason || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: '#595959', maxWidth: '200px' }}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {request.explanation || 'N/A'}
                    </div>
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
                    {request.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleApprove(request)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#52c41a',
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
                          <CheckCircle size={16} />
                          Odobri
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ff4d4f',
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
                          <XCircle size={16} />
                          Odbij
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#8c8c8c', fontSize: '0.875rem' }}>
                        Obrađeno
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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
            <h2 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#262626'
            }}>
              {modalType === 'approve' ? 'Odobri zahtev za popust' : 'Odbij zahtev za popust'}
            </h2>

            {/* Request Details */}
            <div style={{
              padding: '1rem',
              background: '#fafafa',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Pacijent: </span>
                <span style={{ fontWeight: 600, color: '#262626', fontFamily: 'monospace' }}>
                  {selectedRequest.patientId.substring(0, 16)}...
                </span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Razlog: </span>
                <span style={{ fontWeight: 600, color: '#262626' }}>
                  {selectedRequest.reason}
                </span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Traženi popust: </span>
                <span style={{ fontWeight: 700, color: '#1890ff' }}>
                  {selectedRequest.requestedDiscountPercent}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
                  Obrazloženje:
                </div>
                <div style={{
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '6px',
                  color: '#262626',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedRequest.explanation}
                </div>
              </div>
            </div>

            {modalType === 'approve' ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: '#262626'
                  }}>
                    Odobren procenat popusta (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={approvedPercent}
                    onChange={(e) => setApprovedPercent(e.target.value)}
                    placeholder="Unesite procenat"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: '#262626'
                  }}>
                    Maksimalan iznos popusta ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Unesite maksimalan iznos"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={submitApproval}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: processing ? '#d9d9d9' : '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: processing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {processing ? (
                      <>
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Obrađujem...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        <span>Odobri</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeModal}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'white',
                      color: '#262626',
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Otkaži
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: '#262626'
                  }}>
                    Razlog odbijanja
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Unesite razlog odbijanja zahteva..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={submitRejection}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: processing ? '#d9d9d9' : '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: processing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {processing ? (
                      <>
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Obrađujem...</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        <span>Odbij zahtev</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeModal}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'white',
                      color: '#262626',
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Otkaži
                  </button>
                </div>
              </div>
            )}
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

export default DiscountRequestsHospital;