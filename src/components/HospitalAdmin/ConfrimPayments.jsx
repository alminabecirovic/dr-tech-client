import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader, FileText, Download, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const ConfirmPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [preContracts, setPreContracts] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [agencies, setAgencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [paymentsData, contractsData, hospitalsData, agenciesData] = await Promise.all([
        api.getPayments(token),
        api.getPreContracts(token),
        api.getHospitals(token),
        api.getAgencies(token)
      ]);

      // Map hospitals and agencies
      const hospitalMap = {};
      hospitalsData.forEach(h => { hospitalMap[h.id] = h.name; });
      
      const agencyMap = {};
      agenciesData.forEach(a => { agencyMap[a.id] = a.name; });

      setHospitals(hospitalMap);
      setAgencies(agencyMap);
      setPreContracts(contractsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (payment) => {
    if (payment.confirmed) return 'confirmed';
    if (payment.proofUrl) return 'pending';
    return 'waiting';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#52c41a';
      case 'pending': return '#fa8c16';
      case 'waiting': return '#8c8c8c';
      default: return '#8c8c8c';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Potvrđeno';
      case 'pending': return 'Na čekanju potvrde';
      case 'waiting': return 'Čeka uplatu';
      default: return status;
    }
  };

  const handleViewProof = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleConfirmPayment = async (paymentId) => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Get the preContractId for this payment
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        setError('Uplata nije pronađena');
        return;
      }

      // Confirm payment using the endpoint
      await api.post(`/PreContracts/${payment.preContractId}/confirm-payment`, 
        { paymentId: paymentId },
        token
      );

      setSuccess('Uplata je uspešno potvrđena!');
      setShowModal(false);
      setSelectedPayment(null);
      
      // Reload data
      await loadData();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.message || 'Greška pri potvrđivanju uplate');
    } finally {
      setProcessing(false);
    }
  };

  const getContractInfo = (preContractId) => {
    const contract = preContracts.find(c => c.id === preContractId);
    if (!contract) return { hospital: 'N/A', agency: 'N/A' };
    
    return {
      hospital: hospitals[contract.hospitalId] || 'N/A',
      agency: agencies[contract.insuranceAgencyId] || 'N/A',
      contract: contract
    };
  };

  // Filter payments based on user role
  const filteredPayments = payments.filter(payment => {
    if (!payment.proofUrl) return false; // Only show payments with proof
    
    const contractInfo = getContractInfo(payment.preContractId);
    
    // If HospitalAdmin, show only payments for their hospital
    if (user.role === 'HospitalAdmin') {
      return contractInfo.contract?.hospitalId === user.hospitalId;
    }
    
    // If InsuranceAgency, show only payments for their agency
    if (user.role === 'InsuranceAgency') {
      return contractInfo.contract?.insuranceAgencyId === user.agencyId;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite', margin: '2rem auto' }} />
        <p style={{ color: '#8c8c8c' }}>Učitavanje...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
          Potvrđivanje uplata
        </h1>
        <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
          Pregled i potvrda primljenih uplata
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
            Na čekanju potvrde
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fa8c16' }}>
            {filteredPayments.filter(p => !p.confirmed && p.proofUrl).length}
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
            Potvrđeno
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#52c41a' }}>
            {filteredPayments.filter(p => p.confirmed).length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #1890ff'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.5rem' }}>
            Ukupan iznos potvrđenih
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1890ff' }}>
            ${filteredPayments.filter(p => p.confirmed).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <FileText size={64} color="#d9d9d9" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#262626', marginBottom: '0.5rem' }}>Nema uplata</h3>
          <p style={{ color: '#8c8c8c' }}>Trenutno nema uplata za potvrdu.</p>
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
                  Ustanova
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Agencija
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Iznos
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#262626' }}>
                  Rok
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
              {filteredPayments.map((payment, index) => {
                const status = getPaymentStatus(payment);
                const contractInfo = getContractInfo(payment.preContractId);
                const isOverdue = new Date(payment.dueDateUtc) < new Date() && !payment.confirmed;

                return (
                  <tr key={payment.id} style={{
                    borderBottom: index < filteredPayments.length - 1 ? '1px solid #f0f0f0' : 'none',
                    background: isOverdue ? '#fff2f0' : 'white'
                  }}>
                    <td style={{ padding: '1rem', color: '#595959' }}>
                      {payment.paidAtUtc 
                        ? new Date(payment.paidAtUtc).toLocaleDateString('sr-RS')
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', color: '#595959' }}>
                      {contractInfo.hospital}
                    </td>
                    <td style={{ padding: '1rem', color: '#595959' }}>
                      {contractInfo.agency}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1890ff' }}>
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', color: isOverdue ? '#cf1322' : '#595959' }}>
                      {new Date(payment.dueDateUtc).toLocaleDateString('sr-RS')}
                      {isOverdue && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>(Prekoračen)</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        background: `${getStatusColor(status)}20`,
                        color: getStatusColor(status)
                      }}>
                        {getStatusText(status)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {!payment.confirmed && payment.proofUrl ? (
                        <button
                          onClick={() => handleViewProof(payment)}
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
                          Pregledaj
                        </button>
                      ) : payment.confirmed ? (
                        <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={16} />
                          Potvrđeno
                        </span>
                      ) : (
                        <span style={{ color: '#8c8c8c', fontSize: '0.875rem' }}>
                          Nema dokaza
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing proof and confirming */}
      {showModal && selectedPayment && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#262626'
            }}>
              Potvrda uplate
            </h2>

            {/* Payment Details */}
            <div style={{
              padding: '1.5rem',
              background: '#fafafa',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                Detalji uplate
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Iznos: </span>
                  <span style={{ fontWeight: 700, color: '#1890ff', fontSize: '1.25rem' }}>
                    ${selectedPayment.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Rok plaćanja: </span>
                  <span style={{ fontWeight: 600, color: '#262626' }}>
                    {new Date(selectedPayment.dueDateUtc).toLocaleDateString('sr-RS')}
                  </span>
                </div>
              </div>
            </div>

            {/* Proof Image/Document */}
            {selectedPayment.proofUrl && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f0f0f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ marginBottom: '1rem', fontWeight: 600, color: '#262626' }}>
                  Dokaz o uplati:
                </p>
                {selectedPayment.proofUrl.toLowerCase().endsWith('.pdf') ? (
                  <div>
                    <FileText size={64} color="#1890ff" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#595959', marginBottom: '1rem' }}>PDF Dokument</p>
                    <a
                      href={selectedPayment.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#1890ff',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      <Download size={16} />
                      Preuzmi PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedPayment.proofUrl}
                    alt="Dokaz o uplati"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleConfirmPayment(selectedPayment.id)}
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
                    <span>Potvrđujem...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Potvrdi uplatu</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
                }}
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
                Zatvori
              </button>
            </div>
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

export default ConfirmPayments;