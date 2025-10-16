import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from './Layout/Navbar';
import { Plus, Stethoscope, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react';

const Doctors = () => {
  const { token, hasRole } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    specialty: '',
    departmentId: '',
    workingHours: '09:00-17:00',
    isAvailable: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsData, deptData] = await Promise.all([
        api.getDoctors(token),
        api.getDepartments(token)
      ]);
      setDoctors(doctorsData || []);
      setDepartments(deptData || []);
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

    if (!formData.fullName.trim() || !formData.specialty.trim() || !formData.departmentId) {
      setError('Sva obavezna polja moraju biti popunjena');
      return;
    }

    try {
      await api.createDoctor(formData, token);
      setSuccess('Doktor uspešno kreiran!');
      setFormData({
        fullName: '',
        specialty: '',
        departmentId: '',
        workingHours: '09:00-17:00',
        isAvailable: true
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri kreiranju doktora');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Nepoznato';
  };

  const getAvailabilityBadge = (isAvailable) => {
    if (isAvailable) {
      return (
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          background: '#c6f6d5',
          color: '#22543d',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <CheckCircle size={12} />
          Dostupan
        </span>
      );
    }
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        background: '#fed7d7',
        color: '#742a2a',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <XCircle size={12} />
        Nedostupan
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Doktori" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Doktori" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div className="page-header">
          {hasRole('HospitalAdmin') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Dodaj Doktora
            </button>
          )}
        </div>

        {doctors.length === 0 ? (
          <div className="empty-state">
            <Stethoscope size={64} color="#cbd5e0" />
            <h3>Nema doktora</h3>
            <p>Kliknite na "Dodaj Doktora" da dodate prvog doktora</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Ime i Prezime</th>
                  <th>Specijalnost</th>
                  <th>Odeljenje</th>
                  <th>Radno Vreme</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Stethoscope size={20} color="#667eea" />
                        <strong>{doctor.fullName}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        background: '#edf2f7',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {doctor.specialty}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#718096" />
                        {getDepartmentName(doctor.departmentId)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#718096" />
                        {doctor.workingHours}
                      </div>
                    </td>
                    <td>{getAvailabilityBadge(doctor.isAvailable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Doctor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj Novog Doktora</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Ime i Prezime *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Npr. Dr. Marko Marković"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specijalnost *</label>
                  <input
                    type="text"
                    name="specialty"
                    placeholder="Npr. Kardiolog, Hirurg..."
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Odeljenje *</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Izaberite odeljenje</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Radno Vreme</label>
                <input
                  type="text"
                  name="workingHours"
                  placeholder="Npr. 09:00-17:00"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                />
                <small style={{ color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Format: HH:MM-HH:MM
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    style={{ width: 'auto' }}
                  />
                  <span>Dostupan za termine</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Kreiraj Doktora</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-large {
          max-width: 700px;
        }
      `}</style>
    </div>
  );
};

export default Doctors;