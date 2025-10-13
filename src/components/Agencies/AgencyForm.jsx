import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';

const AgencyForm = ({ agency, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || '',
        city: agency.city || ''
      });
    }
  }, [agency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (agency) {
        await api.put(`/Agencies/${agency.id}`, {
          ...formData,
          id: agency.id
        }, token);
      } else {
        await api.post('/Agencies', formData, token);
      }
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju agencije');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{agency ? 'Izmeni agenciju' : 'Dodaj novu agenciju'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Naziv agencije *</label>
            <input
              type="text"
              placeholder="Npr. DDOR Osiguranje"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Grad *</label>
            <input
              type="text"
              placeholder="Npr. Novi Sad"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
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

export default AgencyForm;