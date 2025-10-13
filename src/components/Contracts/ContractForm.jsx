import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';

const ContractForm = ({ contract, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    insuranceAgencyId: '',
    hospitalId: '',
    coveragePercent: '',
    startsOn: '',
    endsOn: '',
    status: 'Proposed',
    rejectionReason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    if (contract) {
      setFormData({
        insuranceAgencyId: contract.insuranceAgencyId || '',
        hospitalId: contract.hospitalId || '',
        coveragePercent: contract.coveragePercent || '',
        startsOn: contract.startsOn?.split('T')[0] || '',
        endsOn: contract.endsOn?.split('T')[0] || '',
        status: contract.status || 'Proposed',
        rejectionReason: contract.rejectionReason || ''
      });
    }
  }, [contract]);

  const loadData = async () => {
    try {
      const [agenciesData, hospitalsData] = await Promise.all([
        api.get('/Agencies', token),
        api.get('/Hospitals', token)
      ]);
      setAgencies(agenciesData);
      setHospitals(hospitalsData);
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
        coveragePercent: parseFloat(formData.coveragePercent)
      };

      if (contract) {
        await api.put(`/Contracts/${contract.id}`, {
          ...payload,
          id: contract.id
        }, token);
      } else {
        await api.post('/Contracts', payload, token);
      }
      onSuccess();
    } catch (err) {
      setError('Greška pri čuvanju ugovora');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contract ? 'Izmeni ugovor' : 'Novi ugovor'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Agencija *</label>
            <select
              value={formData.insuranceAgencyId}
              onChange={(e) => setFormData({ ...formData, insuranceAgencyId: e.target.value })}
              required
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Izaberite agenciju</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

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
            <label>Pokrivenost (%) *</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Npr. 80"
              value={formData.coveragePercent}
              onChange={(e) => setFormData({ ...formData, coveragePercent: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Datum početka *</label>
            <input
              type="date"
              value={formData.startsOn}
              onChange={(e) => setFormData({ ...formData, startsOn: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Datum završetka *</label>
            <input
              type="date"
              value={formData.endsOn}
              onChange={(e) => setFormData({ ...formData, endsOn: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="Proposed">Predložen</option>
              <option value="Accepted">Prihvaćen</option>
              <option value="Rejected">Odbijen</option>
            </select>
          </div>

          {formData.status === 'Rejected' && (
            <div className="form-group">
              <label>Razlog odbijanja</label>
              <input
                type="text"
                placeholder="Npr. Neprihvatljivi uslovi"
                value={formData.rejectionReason}
                onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
              />
            </div>
          )}

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

export default ContractForm;