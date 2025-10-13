import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';

const HospitalForm = ({ hospital, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || '',
        city: hospital.city || ''
      });
    }
  }, [hospital]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (hospital) {
        await api.put(`/Hospitals/${hospital.id}`, {
          ...formData,
          id: hospital.id
        }, token);
      } else {
        await api.post('/Hospitals', formData, token);
      }
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju bolnice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{hospital ? 'Izmeni bolnicu' : 'Dodaj novu bolnicu'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Naziv bolnice *</label>
            <input
              type="text"
              placeholder="Npr. Klinički centar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Grad *</label>
            <input
              type="text"
              placeholder="Npr. Beograd"
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

export default HospitalForm;