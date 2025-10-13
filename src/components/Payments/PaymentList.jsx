import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import PaymentForm from './PaymentForm';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';

const PaymentList = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await api.get('/Payments', token);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const filteredPayments = payments.filter(payment =>
    searchTerm === '' || 
    payment.confirmed.toString().includes(searchTerm.toLowerCase())
  );

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

      <div className="data-table">
        <div className="table-header">
          <h2>Lista plaćanja</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-box">
              <Search size={20} color="#718096" />
              <input
                type="text"
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={20} style={{ marginRight: '8px' }} />
              Novo plaćanje
            </button>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema plaćanja. Kliknite "Novo plaćanje" da kreirate novo.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Iznos</th>
                <th>Rok plaćanja</th>
                <th>Plaćeno</th>
                <th>Zakašnjenja</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: '600', color: '#2d3748' }}>
                    {payment.amount.toLocaleString('sr-RS')} RSD
                  </td>
                  <td>{new Date(payment.dueDateUtc).toLocaleDateString('sr-RS')}</td>
                  <td>
                    {payment.paidAtUtc 
                      ? new Date(payment.paidAtUtc).toLocaleDateString('sr-RS')
                      : '-'
                    }
                  </td>
                  <td>
                    {payment.lateCount > 0 ? (
                      <span style={{ color: '#f5222d', fontWeight: '600' }}>
                        {payment.lateCount}x
                      </span>
                    ) : (
                      <span style={{ color: '#52c41a' }}>0</span>
                    )}
                  </td>
                  <td>
                    {payment.confirmed ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: '#52c41a20',
                        color: '#52c41a',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        <CheckCircle size={14} />
                        Potvrđeno
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: '#faad1420',
                        color: '#faad14',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        <XCircle size={14} />
                        Na čekanju
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <PaymentForm
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadPayments();
          }}
        />
      )}
    </div>
  );
};

export default PaymentList;