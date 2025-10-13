import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

const PaymentForm = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    preContractId: '',
    amount: '',
    dueDateUtc: '',
    proof: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('preContractId', formData.preContractId || '00000000-0000-0000-0000-000000000000');
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('dueDateUtc', formData.dueDateUtc);
      
      if (formData.proof) {
        formDataToSend.append('proof', formData.proof);
      }

      const response = await fetch('http://localhost:5036/api/Payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create payment');
      
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju plaćanja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo plaćanje</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Iznos (RSD) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Npr. 10000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Rok plaćanja *</label>
            <input
              type="date"
              value={formData.dueDateUtc}
              onChange={(e) => setFormData({ ...formData, dueDateUtc: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Dokaz o uplati (opciono)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFormData({ ...formData, proof: e.target.files[0] })}
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
            {formData.proof && (
              <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                Izabran fajl: {formData.proof.name}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;