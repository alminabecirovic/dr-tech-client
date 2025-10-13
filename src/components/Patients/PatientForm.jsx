import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';

const PatientForm = ({ patient, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    insuranceNumber: '',
    allergies: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName || '',
        insuranceNumber: patient.insuranceNumber || '',
        allergies: patient.allergies || ''
      });
    }
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (patient) {
        await api.put(`/Patients/${patient.id}`, {
          ...formData,
          id: patient.id
        }, token);
      } else {
        await api.post('/Patients', formData, token);
      }
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju pacijenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{patient ? 'Izmeni pacijenta' : 'Dodaj novog pacijenta'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ime i prezime *</label>
            <input
              type="text"
              placeholder="Npr. Marko Marković"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Broj osiguranja *</label>
            <input
              type="text"
              placeholder="Npr. 123456789"
              value={formData.insuranceNumber}
              onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Alergije</label>
            <input
              type="text"
              placeholder="Npr. Penicilin, Polen"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
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

export default PatientForm;