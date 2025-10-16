import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Plus, ClipboardList, DollarSign } from 'lucide-react';

const Services = () => {
  const { token, hasRole } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Exam',
    basePrice: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices(token);
      setServices(data || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      setError('Greška pri učitavanju usluga');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Naziv usluge je obavezan');
      return;
    }

    if (formData.basePrice <= 0) {
      setError('Cena mora biti veća od 0');
      return;
    }

    try {
      await api.createService(formData, token);
      setSuccess('Usluga uspešno kreirana!');
      setFormData({
        name: '',
        description: '',
        type: 'Exam',
        basePrice: 0
      });
      setShowModal(false);
      loadServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri kreiranju usluge');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTypeBadge = (type) => {
    const colors = {
      'Exam': { bg: '#bee3f8', color: '#2c5282' },
      'Surgery': { bg: '#fed7d7', color: '#742a2a' },
      'Lab': { bg: '#c6f6d5', color: '#22543d' },
      'Imaging': { bg: '#feebc8', color: '#7c2d12' }
    };
    const style = colors[type] || colors['Exam'];
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        background: style.bg,
        color: style.color
      }}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Medicinske Usluge" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Medicinske Usluge" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div className="page-header">
          <div>
            <h2>Medicinske Usluge</h2>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Pregled svih medicinskih usluga i njihovih cena
            </p>
          </div>
          {hasRole('HospitalAdmin') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Dodaj Uslugu
            </button>
          )}
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={64} color="#cbd5e0" />
            <h3>Nema usluga</h3>
            <p>Kliknite na "Dodaj Uslugu" da dodate prvu uslugu</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Naziv Usluge</th>
                  <th>Tip</th>
                  <th>Opis</th>
                  <th>Osnovna Cena</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ClipboardList size={20} color="#667eea" />
                        <strong>{service.name}</strong>
                      </div>
                    </td>
                    <td>{getTypeBadge(service.type)}</td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#4a5568' }}>
                        {service.description ? (
                          service.description.substring(0, 50) + (service.description.length > 50 ? '...' : '')
                        ) : (
                          <span style={{ color: '#a0aec0' }}>Nema opisa</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={16} color="#48bb78" />
                        <strong style={{ color: '#48bb78' }}>
                            {service.basePrice ? service.basePrice.toFixed(2) : '0.00'} RSD
                        </strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj Novu Uslugu</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Naziv Usluge *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Npr. Opšti pregled, Ultrazvuk, Krvna slika..."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tip Usluge *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Exam">Exam - Pregled</option>
                  <option value="Surgery">Surgery - Operacija</option>
                  <option value="Lab">Lab - Laboratorija</option>
                  <option value="Imaging">Imaging - Dijagnostika</option>
                </select>
              </div>

              <div className="form-group">
                <label>Opis</label>
                <textarea
                  name="description"
                  placeholder="Detaljan opis usluge..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Osnovna Cena (RSD) *</label>
                <input
                  type="number"
                  name="basePrice"
                  placeholder="0.00"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
                <small style={{ color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Cena važi do kraja godine i ne može se menjati naknadno
                </small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Kreiraj Uslugu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;