import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Building2, Search, MapPin, FileText, AlertCircle } from 'lucide-react';

const InsuranceAgencies = () => {
  const { token } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Osiguravajuće agencije</h1>
          <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Pregled svih registrovanih agencija</p>
        </div>

        {/* Error Alert */}
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
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>
              {searchTerm ? 'Nema rezultata pretrage' : 'Nema agencija'}
            </h3>
            <p style={{ color: '#8c8c8c' }}>
              {searchTerm ? 'Pokušajte sa drugim pojmom pretrage' : 'Trenutno nema registrovanih agencija u bazi'}
            </p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceAgencies;