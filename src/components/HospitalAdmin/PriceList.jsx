import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Plus, FileText, DollarSign, Calendar } from 'lucide-react';

const Pricelist = () => {
  const { token, hasRole } = useAuth();
  const [pricelistItems, setPricelistItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicalServiceId: '',
    price: 0,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10)
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pricelistData, servicesData] = await Promise.all([
        api.getPricelist(token),
        api.getServices(token)
      ]);
      setPricelistItems(pricelistData || []);
      setServices(servicesData || []);
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

    if (!formData.medicalServiceId) {
      setError('Morate izabrati uslugu');
      return;
    }

    if (formData.price <= 0) {
      setError('Cena mora biti veća od 0');
      return;
    }

    try {
      await api.createPricelistItem(formData, token);
      setSuccess('Cenovnik uspešno ažuriran!');
      setFormData({
        medicalServiceId: '',
        price: 0,
        validFrom: new Date().toISOString().slice(0, 10),
        validUntil: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10)
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri kreiranju stavke cenovnika');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Nepoznata usluga';
  };

  const isValidNow = (item) => {
    const now = new Date();
    const validFrom = new Date(item.validFrom);
    const validUntil = new Date(item.validUntil);
    return now >= validFrom && now <= validUntil;
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Cenovnik" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Cenovnik" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div className="page-header">
          <div>
            <h2>Cenovnik Usluga</h2>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Cene važe do kraja godine i ne mogu se menjati naknadno
            </p>
          </div>
          {hasRole('HospitalAdmin') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Dodaj Cenu
            </button>
          )}
        </div>

        {pricelistItems.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} color="#cbd5e0" />
            <h3>Nema stavki u cenovniku</h3>
            <p>Kliknite na "Dodaj Cenu" da dodate prvu stavku</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Usluga</th>
                  <th>Cena</th>
                  <th>Važi Od</th>
                  <th>Važi Do</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pricelistItems.map((item) => (
                  <tr key={item.id} style={{ 
                    background: isValidNow(item) ? '#f0fff4' : 'white' 
                  }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} color="#667eea" />
                        <strong>{getServiceName(item.medicalServiceId)}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={16} color="#48bb78" />
                        <strong style={{ color: '#48bb78', fontSize: '16px' }}>
                          {item.price ? item.price.toFixed(2) : '0.00'} RSD
                        </strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#718096" />
                        {new Date(item.validFrom).toLocaleDateString('sr-RS')}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#718096" />
                        {new Date(item.validUntil).toLocaleDateString('sr-RS')}
                      </div>
                    </td>
                    <td>
                      {isValidNow(item) ? (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: '#c6f6d5',
                          color: '#22543d'
                        }}>
                          Aktivno
                        </span>
                      ) : (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: '#e2e8f0',
                          color: '#4a5568'
                        }}>
                          Neaktivno
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Pricelist Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj Stavku Cenovnika</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Usluga *</label>
                <select
                  name="medicalServiceId"
                  value={formData.medicalServiceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Izaberite uslugu</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cena (RSD) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Važi Od *</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Važi Do *</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                background: '#fff5f5',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                color: '#742a2a',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                ⚠️ <strong>Napomena:</strong> Nakon kreiranja, cena se ne može menjati!
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Kreiraj Stavku</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricelist;