import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';

const PriceListForm = ({ item, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    hospitalId: '',
    medicalServiceId: '',
    price: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    if (item) {
      setFormData({
        hospitalId: item.hospitalId || '',
        medicalServiceId: item.medicalServiceId || '',
        price: item.price || '',
        validFrom: item.validFrom?.split('T')[0] || '',
        validUntil: item.validUntil?.split('T')[0] || '',
        isActive: item.isActive ?? true
      });
    }
  }, [item]);

  const loadData = async () => {
    try {
      const [hospitalsData, servicesData] = await Promise.all([
        api.get('/Hospitals', token),
        api.get('/Services', token)
      ]);
      setHospitals(hospitalsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (item) {
        await api.put(`/PriceList/${item.id}`, {
          ...payload,
          id: item.id
        }, token);
      } else {
        await api.post('/PriceList', payload, token);
      }
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju stavke cenovnika');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Izmeni stavku' : 'Nova stavka cenovnika'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Bolnica *</label>
            <select
              value={formData.hospitalId}
              onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
              required
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Izaberite bolnicu</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Medicinska usluga *</label>
            <select
              value={formData.medicalServiceId}
              onChange={(e) => setFormData({ ...formData, medicalServiceId: e.target.value })}
              required
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Izaberite uslugu</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cena (RSD) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Npr. 5000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Važi od *</label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Važi do *</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              Aktivna stavka
            </label>
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

export default PriceListForm;