import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Percent, Plus, Search, User, Hospital, CheckCircle, Clock, XCircle, Calculator, AlertCircle, Building2 } from 'lucide-react';

const InsuranceDiscounts = () => {
  const { token, user } = useAuth();
  const [discountRequests, setDiscountRequests] = useState([]);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [formData, setFormData] = useState({
    insuranceAgencyId: user?.id || '',
    hospitalId: '',
    patientId: '',
    requestedDiscountPercent: 5,
    reason: 'Children',
    explanation: ''
  });
  const [calcData, setCalcData] = useState({
    serviceIds: '',
    result: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, discountsData, agenciesData, hospitalsData, patientsData] = await Promise.all([
        api.get('/Discount/requests', token),
        api.get('/Discount', token),
        api.get('/Agencies', token),
        api.get('/Hospitals', token),
        api.get('/Patients', token)
      ]);

      setDiscountRequests(requestsData || []);
      setActiveDiscounts(discountsData || []);
      setAgencies(agenciesData || []);
      setHospitals(hospitalsData || []);
      setPatients(patientsData || []);
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

    if (!formData.insuranceAgencyId || !formData.hospitalId || !formData.patientId || !formData.explanation) {
      setError('Sva polja su obavezna');
      return;
    }

    try {
      await api.post('/Discount/request', formData, token);
      setSuccess('Zahtev za popust uspešno poslat!');
      setFormData({
        insuranceAgencyId: '',
        hospitalId: '',
        patientId: '',
        requestedDiscountPercent: 5,
        reason: 'Children',
        explanation: ''
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Greška pri slanju zahteva');
      console.error(err);
    }
  };

  const calculateDiscount = async () => {
    setError('');
    if (!calcData.serviceIds) {
      setError('Unesite ID-eve usluga (odvojene zarezom)');
      return;
    }

    try {
      const serviceIdsArray = calcData.serviceIds.split(',').map(id => id.trim());
      const result = await api.post('/Discount/calculate', { serviceIds: serviceIdsArray }, token);
      setCalcData({ ...calcData, result });
    } catch (err) {
      setError('Greška pri izračunavanju popusta');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
      Approved: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      Rejected: { bg: '#fff2f0', color: '#cf1322', border: '#ffccc7' }
    };
    const icons = {
      Pending: <Clock size={14} />,
      Approved: <CheckCircle size={14} />,
      Rejected: <XCircle size={14} />
    };
    const labels = {
      Pending: 'Na čekanju',
      Approved: 'Odobren',
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
        {labels[status]}
      </span>
    );
  };

  const stats = {
    pending: discountRequests.filter(r => r.status === 'Pending').length,
    approved: discountRequests.filter(r => r.status === 'Approved').length,
    rejected: discountRequests.filter(r => r.status === 'Rejected').length,
    active: activeDiscounts.filter(d => d.isActive && new Date(d.validUntil) > new Date()).length
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Popusti" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Popusti" />
      
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Popusti</h1>
            <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Upravljajte zahtevima za posebne popuste</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setShowCalculator(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#722ed1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Calculator size={20} />
              <span>Kalkulator</span>
            </button>
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
              <span>Novi zahtev</span>
            </button>
          </div>
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
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fa8c16' }}>{stats.pending}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Na čekanju</div>
              </div>
              <Clock size={32} color="#fa8c16" />
            </div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#52c41a' }}>{stats.approved}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Odobreni</div>
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
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1890ff' }}>{stats.active}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Aktivni popusti</div>
              </div>
              <Percent size={32} color="#1890ff" />
            </div>
          </div>
        </div>

        {/* Discount Requests Table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#262626' }}>Zahtevi za popust</h2>
          </div>
          {discountRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Percent size={64} color="#d9d9d9" />
              <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema zahteva</h3>
              <p style={{ color: '#8c8c8c' }}>Kreirajte prvi zahtev za poseban popust</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Pacijent
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Agencija
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Bolnica
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Popust
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Razlog
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody>
                {discountRequests.map((request) => {
                  const patient = patients.find(p => p.id === request.patientId);
                  const agency = agencies.find(a => a.id === request.insuranceAgencyId);
                  const hospital = hospitals.find(h => h.id === request.hospitalId);
                  return (
                    <tr key={request.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
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
                            <User size={20} color="#1890ff" />
                          </div>
                          <span style={{ fontWeight: 500, color: '#262626' }}>{patient?.fullName || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={16} color="#8c8c8c" />
                          <span style={{ color: '#595959', fontSize: '0.875rem' }}>{agency?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Hospital size={16} color="#8c8c8c" />
                          <span style={{ color: '#595959', fontSize: '0.875rem' }}>{hospital?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959' }}>
                          <Percent size={16} />
                          <span style={{ fontWeight: 600 }}>{request.requestedDiscountPercent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: '#f5f5f5',
                          color: '#595959'
                        }}>
                          {request.reason}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(request.status)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#8c8c8c' }}>
                        {new Date(request.requestedAtUtc).toLocaleDateString('sr-RS')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Active Discounts */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: 600, color: '#262626' }}>Aktivni popusti</h2>
          {activeDiscounts.filter(d => d.isActive).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#8c8c8c' }}>Nema aktivnih popusta</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {activeDiscounts.filter(d => d.isActive && new Date(d.validUntil) > new Date()).map((discount) => {
                const patient = patients.find(p => p.id === discount.patientId);
                return (
                  <div key={discount.id} style={{
                    padding: '1.25rem',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    background: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #52c41a15, #52c41a25)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Percent size={24} color="#52c41a" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.25rem', color: '#52c41a' }}>
                          {discount.discountPercent}% OFF
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                          Max: ${discount.maxDiscountAmount}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#595959', marginBottom: '0.5rem' }}>
                      <strong>Pacijent:</strong> {patient?.fullName || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#595959', marginBottom: '0.5rem' }}>
                      <strong>Razlog:</strong> {discount.reason}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                      Važeći do: {new Date(discount.validUntil).toLocaleDateString('sr-RS')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Zahtev za popust</h2>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pacijent</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Izaberite pacijenta</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.fullName}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Procenat popusta (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.requestedDiscountPercent}
                  onChange={(e) => setFormData({ ...formData, requestedDiscountPercent: parseFloat(e.target.value) })}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Razlog</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="Children">Deca</option>
                  <option value="Disabled">Invalidi</option>
                  <option value="Special">Poseban slučaj</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Obrazloženje</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Detaljno objasnite razlog za zahtev..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
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
                  Pošalji zahtev
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculator && (
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
        }} onClick={() => setShowCalculator(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Kalkulator popusta</h2>
              <button onClick={() => setShowCalculator(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                color: '#8c8c8c',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                ID-evi usluga (odvojeni zarezom)
              </label>
              <input
                type="text"
                value={calcData.serviceIds}
                onChange={(e) => setCalcData({ ...calcData, serviceIds: e.target.value })}
                placeholder="npr: id1, id2, id3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.5rem' }}>
                Unesite ID-eve medicinskih usluga odvojene zarezom
              </div>
            </div>
            
            <button
              onClick={calculateDiscount}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: '#722ed1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              <Calculator size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Izračunaj popust
            </button>

            {calcData.result && (
              <div style={{
                padding: '1.5rem',
                background: '#f0f5ff',
                border: '1px solid #adc6ff',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1890ff' }}>Rezultat:</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#595959' }}>Ukupna vrednost:</span>
                    <span style={{ fontWeight: 600, color: '#262626' }}>${calcData.result.totalValue.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#595959' }}>Procenat popusta:</span>
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>{calcData.result.discountPercent}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#595959' }}>Max popust:</span>
                    <span style={{ fontWeight: 600, color: '#262626' }}>${calcData.result.maxDiscountAmount.toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '2px solid #adc6ff',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{ fontWeight: 600, color: '#262626' }}>Konačan popust:</span>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#52c41a' }}>
                      ${calcData.result.calculatedDiscount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setCalcData({ serviceIds: '', result: null });
                setShowCalculator(false);
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: '#f5f5f5',
                color: '#595959',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceDiscounts;