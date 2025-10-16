import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import {
  DollarSign,
  Plus,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';

const MyPayments = () => {
  const { token, user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [preContracts, setPreContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    preContractId: '',
    amount: '',
    dueDateUtc: '',
    proofFile: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, preContractsData] = await Promise.all([
        api.get('/Payments', token),
        api.get('/PreContracts', token).catch(() => [])
      ]);

      setPayments(paymentsData || []);
      setPreContracts(preContractsData || []);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Dozvoljeni su samo JPEG, PNG i PDF fajlovi');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Fajl ne sme biti veći od 5MB');
        return;
      }
      setFormData({ ...formData, proofFile: file });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.preContractId || !formData.amount || !formData.dueDateUtc) {
      setError('Sva polja su obavezna');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('PreContractId', formData.preContractId);
      formDataToSend.append('Amount', formData.amount);
      formDataToSend.append('DueDateUtc', formData.dueDateUtc);

      if (formData.proofFile) {
        formDataToSend.append('Proof', formData.proofFile);
      }

      await api.createPayment(formDataToSend, token);

      setSuccess('Uplata uspešno poslata! Čeka se potvrda.');
      setFormData({
        preContractId: '',
        amount: '',
        dueDateUtc: '',
        proofFile: null
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Greška pri kreiranju uplate');
      console.error(err);
    }
  };

  const getStatusBadge = (confirmed, lateCount) => {
    if (confirmed) {
      return (
        <span
          style={{
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
          }}
        >
          <CheckCircle size={14} />
          Potvrđeno
        </span>
      );
    } else if (lateCount >= 2) {
      return (
        <span
          style={{
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
          }}
        >
          <XCircle size={14} />
          Zakašnjenje ({lateCount})
        </span>
      );
    } else {
      return (
        <span
          style={{
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
          }}
        >
          <Clock size={14} />
          Na čekanju
        </span>
      );
    }
  };

  const stats = {
    total: payments.length,
    confirmed: payments.filter((p) => p.confirmed).length,
    pending: payments.filter((p) => !p.confirmed).length,
    totalAmount: payments
      .filter((p) => p.confirmed)
      .reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments
      .filter((p) => !p.confirmed)
      .reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Moja plaćanja" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Moja plaćanja" />

      <div className="dashboard-container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#262626',
                margin: 0
              }}
            >
              Moja plaćanja
            </h1>
            <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
              Upravljajte svojim uplatama i ratama
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Plus size={20} />
            <span>Nova uplata</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fff2f0',
              color: '#cf1322',
              border: '1px solid #ffccc7'
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              background: '#f6ffed',
              color: '#52c41a',
              border: '1px solid #b7eb8f'
            }}
          >
            {success}
          </div>
        )}

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '12px'
            }}
          >
            <DollarSign size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>
              Nema plaćanja
            </h3>
            <p style={{ color: '#8c8c8c' }}>Kreirajte prvu uplatu</p>
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead
                style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
              >
                <tr>
                  <th style={thStyle}>Pre-ugovor ID</th>
                  <th style={thStyle}>Iznos</th>
                  <th style={thStyle}>Rok plaćanja</th>
                  <th style={thStyle}>Datum uplate</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Dokaz</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #722ed115, #722ed125)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FileText size={20} color="#722ed1" />
                        </div>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            color: '#595959'
                          }}
                        >
                          {payment.preContractId.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={16} color="#8c8c8c" />
                        <span
                          style={{
                            fontWeight: 600,
                            color: '#262626',
                            fontSize: '1.125rem'
                          }}
                        >
                          ${payment.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="#8c8c8c" />
                        <span style={{ color: '#595959' }}>
                          {new Date(payment.dueDateUtc).toLocaleDateString('sr-RS')}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.875rem', color: '#595959' }}>
                      {payment.paidAtUtc
                        ? new Date(payment.paidAtUtc).toLocaleDateString('sr-RS')
                        : '-'}
                    </td>
                    <td style={tdStyle}>{getStatusBadge(payment.confirmed, payment.lateCount)}</td>
                    <td style={tdStyle}>
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
                        <span style={{ color: '#8c8c8c', fontSize: '0.875rem' }}>
                          Nema dokaza
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Stilovi za th i td radi preglednosti
const thStyle = {
  padding: '1rem 1.5rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#8c8c8c',
  textTransform: 'uppercase'
};

const tdStyle = {
  padding: '1rem 1.5rem'
};

export default MyPayments;
