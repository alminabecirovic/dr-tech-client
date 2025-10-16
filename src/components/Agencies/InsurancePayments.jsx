import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { DollarSign, CheckCircle, Clock, XCircle, AlertCircle, FileText, Calendar, User } from 'lucide-react';

const InsurancePayments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [preContracts, setPreContracts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, preContractsData, patientsData] = await Promise.all([
        api.get('/Payments', token),
        api.get('/PreContracts', token).catch(() => []),
        api.get('/Patients', token).catch(() => [])
      ]);

      setPayments(paymentsData || []);
      setPreContracts(preContractsData || []);
      setPatients(patientsData || []);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentId) => {
    setError('');
    setSuccess('');

    try {
      await api.put(`/Payments/${paymentId}/confirm`, {}, token);
      setSuccess('Uplata uspešno potvrđena!');
      setShowConfirmModal(false);
      setSelectedPayment(null);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Greška pri potvrđivanju uplate');
      console.error(err);
    }
  };

  const getStatusBadge = (confirmed, lateCount) => {
    if (confirmed) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          background: '#f6ffed',
          color: '#52c41a',
          border: '1px solid #b7eb8f'
        }}>
          <CheckCircle size={14} />
          Potvrđeno
        </span>
      );
    } else if (lateCount >= 2) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          background: '#fff2f0',
          color: '#cf1322',
          border: '1px solid #ffccc7'
        }}>
          <XCircle size={14} />
          Zakašnjenje ({lateCount})
        </span>
      );
    } else {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          background: '#fff7e6',
          color: '#fa8c16',
          border: '1px solid #ffd591'
        }}>
          <Clock size={14} />
          Na čekanju
        </span>
      );
    }
  };

  const stats = {
    total: payments.length,
    confirmed: payments.filter(p => p.confirmed).length,
    pending: payments.filter(p => !p.confirmed).length,
    totalAmount: payments.filter(p => p.confirmed).reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => !p.confirmed).reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Plaćanja" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Plaćanja" />
      <div className="dashboard-container">

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Plaćanja</h1>
          <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Pregledajte i potvrdite uplate od osiguranika</p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#fff2f0',
            color: '#cf1322',
            border: '1px solid #ffccc7'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            background: '#f6ffed',
            color: '#52c41a',
            border: '1px solid #b7eb8f'
          }}>
            {success}
          </div>
        )}

        {/* Stats */}
        {/* (stat kartice ostaju iste kao u tvom kodu, izostavljene radi kraćeg prikaza) */}

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
            <DollarSign size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema plaćanja</h3>
            <p style={{ color: '#8c8c8c' }}>Još nema pristiglih uplata</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>Osiguranik</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Iznos</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Rok plaćanja</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Datum uplate</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Dokaz</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Akcija</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const preContract = preContracts.find(pc => pc.id === payment.preContractId);
                  const patient = patients.find(p => p.id === preContract?.patientId);

                  return (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(135deg, #1890ff15, #1890ff25)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <User size={20} color="#1890ff" />
                          </div>
                          <span style={{ fontWeight: 500, color: '#262626' }}>
                            {patient?.fullName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <DollarSign size={16} color="#8c8c8c" /> ${payment.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {new Date(payment.dueDateUtc).toLocaleDateString('sr-RS')}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString('sr-RS') : '-'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(payment.confirmed, payment.lateCount)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {payment.proofUrl ? (
                          <a
                            href={payment.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              background: '#f0f5ff',
                              color: '#1890ff',
                              border: '1px solid #adc6ff',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              textDecoration: 'none'
                            }}
                          >
                            <FileText size={16} />
                            Pogledaj
                          </a>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>Nema dokaza</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {!payment.confirmed ? (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowConfirmModal(true);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#52c41a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <CheckCircle size={16} />
                            Potvrdi
                          </button>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>Potvrđeno</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Potvrdi uplatu</h2>
              <button onClick={() => setShowConfirmModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                color: '#8c8c8c',
                cursor: 'pointer'
              }}>×</button>
            </div>

            <div style={{ background: '#fafafa', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Iznos:</span>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>${selectedPayment.amount.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Rok plaćanja:</span>
                <div>{new Date(selectedPayment.dueDateUtc).toLocaleDateString('sr-RS')}</div>
              </div>

              {selectedPayment.proofUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <a
                    href={selectedPayment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#f0f5ff',
                      color: '#1890ff',
                      border: '1px solid #adc6ff',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}
                  >
                    <FileText size={16} />
                    Pogledaj dokaz o uplati
                  </a>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: '#595959', marginBottom: '1.5rem' }}>
              Da li ste sigurni da želite da potvrdite ovu uplatu?
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#f5f5f5',
                  color: '#595959',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Otkaži
              </button>
              <button
                onClick={() => confirmPayment(selectedPayment.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#52c41a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <CheckCircle size={18} />
                Potvrdi uplatu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsurancePayments;
