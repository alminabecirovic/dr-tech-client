import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';

const DoctorForm = ({ doctor, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    specialty: '',
    departmentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
    if (doctor) {
      setFormData({
        fullName: doctor.fullName || '',
        specialty: doctor.specialty || '',
        departmentId: doctor.departmentId || ''
      });
    }
  }, [doctor]);

  const loadDepartments = async () => {
    try {
      const data = await api.get('/Departments', token);
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (doctor) {
        await api.put(`/Doctors/${doctor.id}`, {
          ...formData,
          id: doctor.id
        }, token);
      } else {
        await api.post('/Doctors', formData, token);
      }
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju doktora');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{doctor ? 'Izmeni doktora' : 'Dodaj novog doktora'}</h2>
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
              placeholder="Npr. Dr. Petar Petrović"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Specijalnost *</label>
            <input
              type="text"
              placeholder="Npr. Kardiolog"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Odeljenje *</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              required
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Izaberite odeljenje</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
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

export default DoctorForm;