import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Building2, Plus, Search, MapPin, FileText, Edit, Trash2, AlertCircle } from 'lucide-react';

const InsuranceAgencies = () => {
  const { token } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const data = await api.get('/Agencies', token);
      setAgencies(data || []);
    } catch (error) {
      setError('Greška pri učitavanju agencija');
      console.error('Failed to load agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.city) {
      setError('Sva polja su obavezna');
      return;
    }

    try {
      await api.post('/Agencies', formData, token);
      setSuccess('Agencija uspešno kreirana!');
      setFormData({ name: '', city: '' });
      setShowModal(false);
      loadAgencies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Greška pri kreiranju agencije');
      console.error('Failed to create agency:', error);
    }
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Osiguravajuće agencije" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Osiguravajuće agencije" />
      
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Osiguravajuće agencije</h1>
            <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Upravljajte svim registrovanim agencijama</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Plus size={20} />
            <span>Nova agencija</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#fff2f0',
            color: '#cf1322',
            border: '1px solid #ffccc7'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            background: '#f6ffed',
            color: '#52c41a',
            border: '1px solid #b7eb8f'
          }}>
            {success}
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8c8c8c'
          }} />
          <input
            type="text"
            placeholder="Pretraži agencije po imenu ili gradu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Building2 size={24} color="#1890ff" />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#262626' }}>{agencies.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Ukupno agencija</div>
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <FileText size={24} color="#52c41a" />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#262626' }}>
                {agencies.reduce((sum, a) => sum + (a.contractsCount || 0), 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Ukupno ugovora</div>
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <MapPin size={24} color="#fa8c16" />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#262626' }}>
                {new Set(agencies.map(a => a.city)).size}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Gradova</div>
            </div>
          </div>
        </div>

        {/* Agencies Grid */}
        {filteredAgencies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
            <Building2 size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema agencija</h3>
            <p style={{ color: '#8c8c8c' }}>Dodajte prvu agenciju klikom na dugme "Nova agencija"</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredAgencies.map((agency) => (
              <div key={agency.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #1890ff15, #1890ff25)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Building2 size={32} color="#1890ff" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#262626', margin: '0 0 0.75rem 0' }}>
                  {agency.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} color="#8c8c8c" />
                  <span>{agency.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959', fontSize: '0.9rem' }}>
                  <FileText size={16} color="#8c8c8c" />
                  <span>{agency.contractsCount || 0} ugovora</span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <button style={{
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#595959'
                  }}>
                    <Edit size={18} />
                  </button>
                  <button style={{
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#595959'
                  }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Nova agencija</h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                color: '#8c8c8c',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Naziv agencije</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Unesite naziv agencije"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Grad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Unesite grad"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#f5f5f5',
                  color: '#595959',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  Otkaži
                </button>
                <button type="submit" style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  Kreiraj agenciju
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceAgencies;