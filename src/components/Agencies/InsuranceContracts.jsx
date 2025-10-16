import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { FileText, Plus, Search, Building2, Hospital, CheckCircle, Clock, XCircle, Calendar, Percent } from 'lucide-react';

const InsuranceContracts = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    insuranceAgencyId: '',
    hospitalId: '',
    coveragePercent: 70,
    startsOn: '',
    endsOn: '',
    status: 'Proposed'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, agenciesData, hospitalsData] = await Promise.all([
        api.get('/Contracts', token),
        api.get('/Agencies', token),
        api.get('/Hospitals', token)
      ]);

      setContracts(contractsData || []);
      setAgencies(agenciesData || []);
      setHospitals(hospitalsData || []);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.insuranceAgencyId || !formData.hospitalId || !formData.startsOn || !formData.endsOn) {
      setError('Sva polja su obavezna');
      return;
    }

    try {
      await api.post('/Contracts', formData, token);
      setSuccess('Ugovor uspešno poslat!');
      setFormData({
        insuranceAgencyId: '',
        hospitalId: '',
        coveragePercent: 70,
        startsOn: '',
        endsOn: '',
        status: 'Proposed'
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Greška pri kreiranju ugovora');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Proposed: { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
      Accepted: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      Rejected: { bg: '#fff2f0', color: '#cf1322', border: '#ffccc7' }
    };
    const icons = {
      Proposed: <Clock size={14} />,
      Accepted: <CheckCircle size={14} />,
      Rejected: <XCircle size={14} />
    };
    const labels = {
      Proposed: 'Na čekanju',
      Accepted: 'Prihvaćen',
      Rejected: 'Odbijen'
    };
    const style = styles[status] || { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`
      }}>
        {icons[status]}
        {labels[status] || status}
      </span>
    );
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const agency = agencies.find(a => a.id === contract.insuranceAgencyId);
    const hospital = hospitals.find(h => h.id === contract.hospitalId);
    const matchesSearch = 
      agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (searchTerm === '' || matchesSearch);
  });

  const stats = {
    total: contracts.length,
    proposed: contracts.filter(c => c.status === 'Proposed').length,
    accepted: contracts.filter(c => c.status === 'Accepted').length,
    rejected: contracts.filter(c => c.status === 'Rejected').length
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Ugovori" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Ugovori" />
      
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Ugovori</h1>
            <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Upravljajte ugovorima sa bolnicama</p>
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
            <span>Novi ugovor</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            background: '#fff2f0',
            color: '#cf1322',
            border: '1px solid #ffccc7'
          }}>
            {error}
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

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#262626' }}>{stats.total}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Ukupno</div>
              </div>
              <FileText size={32} color="#1890ff" />
            </div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fa8c16' }}>{stats.proposed}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Na čekanju</div>
              </div>
              <Clock size={32} color="#fa8c16" />
            </div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#52c41a' }}>{stats.accepted}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Prihvaćeni</div>
              </div>
              <CheckCircle size={32} color="#52c41a" />
            </div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#cf1322' }}>{stats.rejected}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Odbijeni</div>
              </div>
              <XCircle size={32} color="#cf1322" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8c8c8c'
            }} />
            <input
              type="text"
              placeholder="Pretraži po agenciji ili bolnici..."
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">Svi statusi</option>
            <option value="Proposed">Na čekanju</option>
            <option value="Accepted">Prihvaćeni</option>
            <option value="Rejected">Odbijeni</option>
          </select>
        </div>

        {/* Contracts Table */}
        {filteredContracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
            <FileText size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema ugovora</h3>
            <p style={{ color: '#8c8c8c' }}>Kreirajte prvi ugovor sa bolnicom</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Agencija
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Bolnica
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Pokriće
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Period
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Razlog odbijanja
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => {
                  const agency = agencies.find(a => a.id === contract.insuranceAgencyId);
                  const hospital = hospitals.find(h => h.id === contract.hospitalId);
                  return (
                    <tr key={contract.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #1890ff15, #1890ff25)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Building2 size={20} color="#1890ff" />
                          </div>
                          <span style={{ fontWeight: 500, color: '#262626' }}>{agency?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #52c41a15, #52c41a25)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Hospital size={20} color="#52c41a" />
                          </div>
                          <span style={{ fontWeight: 500, color: '#262626' }}>{hospital?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959' }}>
                          <Percent size={16} />
                          <span style={{ fontWeight: 600 }}>{contract.coveragePercent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8c8c8c', fontSize: '0.875rem' }}>
                          <Calendar size={16} />
                          <span>
                            {new Date(contract.startsOn).toLocaleDateString('sr-RS')} - {new Date(contract.endsOn).toLocaleDateString('sr-RS')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(contract.status)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#8c8c8c' }}>
                        {contract.rejectionReason || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Novi ugovor</h2>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Agencija</label>
                <select
                  value={formData.insuranceAgencyId}
                  onChange={(e) => setFormData({ ...formData, insuranceAgencyId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Izaberite agenciju</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Bolnica</label>
                <select
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Izaberite bolnicu</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Procenat pokrića (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.coveragePercent}
                  onChange={(e) => setFormData({ ...formData, coveragePercent: parseFloat(e.target.value) })}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Početak</label>
                  <input
                    type="date"
                    value={formData.startsOn}
                    onChange={(e) => setFormData({ ...formData, startsOn: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kraj</label>
                  <input
                    type="date"
                    value={formData.endsOn}
                    onChange={(e) => setFormData({ ...formData, endsOn: e.target.value })}
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
                  Pošalji ugovor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceContracts;