import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { FileText, Search, Building2, CheckCircle, XCircle, Clock, Calendar, Percent, AlertCircle } from 'lucide-react';

const HospitalContracts = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, agenciesData] = await Promise.all([
        api.get('/Contracts', token),
        api.get('/Agencies', token)
      ]);
      setContracts(contractsData || []);
      setAgencies(agenciesData || []);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (contractId) => {
    setError('');
    setSuccess('');
    try {
      const contract = contracts.find(c => c.id === contractId);
      await api.put(`/Contracts/${contractId}`, {
        ...contract,
        status: 'Accepted',
        rejectionReason: null
      }, token);
      setSuccess('Ugovor uspešno prihvaćen!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Greška pri prihvatanju ugovora');
    }
  };

  const handleRejectClick = (contract) => {
    setSelectedContract(contract);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setError('Razlog odbijanja je obavezan');
      return;
    }
    try {
      await api.put(`/Contracts/${selectedContract.id}`, {
        ...selectedContract,
        status: 'Rejected',
        rejectionReason: rejectionReason
      }, token);
      setSuccess('Ugovor odbijen');
      setShowRejectModal(false);
      setSelectedContract(null);
      setRejectionReason('');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Greška pri odbijanju ugovora');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Proposed: { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591', icon: <Clock size={14} />, label: 'Na čekanju' },
      Accepted: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f', icon: <CheckCircle size={14} />, label: 'Prihvaćen' },
      Rejected: { bg: '#fff2f0', color: '#cf1322', border: '#ffccc7', icon: <XCircle size={14} />, label: 'Odbijen' }
    };
    const style = config[status] || { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9', icon: null, label: status };
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
        {style.icon}
        {style.label}
      </span>
    );
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const agency = agencies.find(a => a.id === contract.insuranceAgencyId);
    const matchesSearch = agency?.name?.toLowerCase().includes(searchTerm.toLowerCase());
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
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Prihvaćeno</div>
              </div>
              <CheckCircle size={32} color="#52c41a" />
            </div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#cf1322' }}>{stats.rejected}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Odbijeno</div>
              </div>
              <XCircle size={32} color="#cf1322" />
            </div>
          </div>
        </div>

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
              placeholder="Pretraži po agenciji..."
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

        {filteredContracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
            <FileText size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema zahteva</h3>
            <p style={{ color: '#8c8c8c' }}>Trenutno nema pristiglih zahteva za ugovor</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredContracts.map((contract) => {
              const agency = agencies.find(a => a.id === contract.insuranceAgencyId);
              return (
                <div key={contract.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: contract.status === 'Proposed' ? '2px solid #ffd591' : '1px solid #f0f0f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #1890ff15, #1890ff25)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building2 size={28} color="#1890ff" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#262626', margin: '0 0 0.25rem 0' }}>
                          {agency?.name || 'N/A'}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#8c8c8c', margin: 0 }}>
                          {agency?.city || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#fafafa',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>PROCENAT POKRIĆA</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#262626', fontWeight: 600 }}>
                        <Percent size={16} />
                        <span>{contract.coveragePercent}%</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>PERIOD VAŽENJA</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#262626', fontSize: '0.875rem' }}>
                        <Calendar size={16} />
                        <span>
                          {new Date(contract.startsOn).toLocaleDateString('sr-RS')} - {new Date(contract.endsOn).toLocaleDateString('sr-RS')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {contract.rejectionReason && (
                    <div style={{
                      padding: '1rem',
                      background: '#fff2f0',
                      border: '1px solid #ffccc7',
                      borderRadius: '6px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#cf1322', fontWeight: 600, marginBottom: '0.25rem' }}>
                        RAZLOG ODBIJANJA
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>
                        {contract.rejectionReason}
                      </div>
                    </div>
                  )}

                  {contract.status === 'Proposed' && (
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                      <button
                        onClick={() => handleAccept(contract.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: '#52c41a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle size={18} />
                        <span>Prihvati</span>
                      </button>
                      <button
                        onClick={() => handleRejectClick(contract)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: '#cf1322',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <XCircle size={18} />
                        <span>Odbij</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showRejectModal && (
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
        }} onClick={() => setShowRejectModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Odbij ugovor</h2>
              <button onClick={() => setShowRejectModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                color: '#8c8c8c',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Razlog odbijanja <span style={{ color: '#cf1322' }}>*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Unesite razlog zbog kojeg odbijate ovaj ugovor..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowRejectModal(false)} style={{
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
              <button onClick={handleRejectSubmit} style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: '#cf1322',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Potvrdi odbijanje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalContracts;