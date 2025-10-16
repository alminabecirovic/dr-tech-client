import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '..//../services/api';
import Navbar from './../Layout/Navbar';
import { Plus, Building2, Hospital, Users } from 'lucide-react';

const Departments = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    doctorsCount: 0,
    hospitalId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [depts, hosps] = await Promise.all([
        api.getDepartments(token),
        api.getHospitals(token)
      ]);
      setDepartments(depts || []);
      setHospitals(hosps || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.hospitalId) {
      setError('Naziv i bolnica su obavezni');
      return;
    }

    try {
      await api.createDepartment({
        name: formData.name,
        doctorsCount: parseInt(formData.doctorsCount) || 0,
        hospitalId: formData.hospitalId
      }, token);
      
      setSuccess('Odeljenje uspešno kreirano!');
      setFormData({ name: '', doctorsCount: 0, hospitalId: '' });
      setShowModal(false);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri kreiranju odeljenja');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    return hospital ? hospital.name : 'Nepoznata bolnica';
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Odeljenja" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Odeljenja" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div className="page-header">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Dodaj Odeljenje
          </button>
        </div>

        {departments.length === 0 ? (
          <div className="empty-state">
            <Building2 size={64} color="#cbd5e0" />
            <h3>Nema odeljenja</h3>
            <p>Kliknite na "Dodaj Odeljenje" da dodate prvo odeljenje</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Naziv Odeljenja</th>
                  <th>Bolnica</th>
                  <th>Broj Doktora</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Building2 size={20} color="#667eea" />
                        <strong>{dept.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Hospital size={16} color="#718096" />
                        {getHospitalName(dept.hospitalId)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#718096" />
                        {dept.doctorsCount}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj Novo Odeljenje</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bolnica *</label>
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Izaberite bolnicu</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Naziv Odeljenja *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Npr. Hirurgija, Pedijatrija, Interno..."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Broj Doktora</label>
                <input
                  type="number"
                  name="doctorsCount"
                  placeholder="0"
                  value={formData.doctorsCount}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">
                  Kreiraj Odeljenje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;