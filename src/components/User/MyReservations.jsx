import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Calendar, Plus, Hospital, Activity, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

const MyReservations = () => {
  const { token, user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: '',
    departmentId: '',
    patientId: user?.id || '',
    medicalServiceId: '',
    startsAtUtc: '',
    endsAtUtc: '',
    status: 'Pending'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, hospitalsData, departmentsData, servicesData] = await Promise.all([
        api.get('/Reservations', token),
        api.get('/Hospitals', token),
        api.get('/Departments', token),
        api.get('/Services', token)
      ]);

      // Filter reservations for current user if role is InsuredUser
      const userReservations = reservationsData?.filter(r => r.patientId === user?.id) || reservationsData || [];
      setReservations(userReservations);
      setHospitals(hospitalsData || []);
      setDepartments(departmentsData || []);
      setServices(servicesData || []);
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

    if (!formData.hospitalId || !formData.departmentId || !formData.medicalServiceId || !formData.startsAtUtc || !formData.endsAtUtc) {
      setError('Sva polja su obavezna');
      return;
    }

    // Check if dates are valid
    const start = new Date(formData.startsAtUtc);
    const end = new Date(formData.endsAtUtc);
    if (start >= end) {
      setError('Datum završetka mora biti posle datuma početka');
      return;
    }

    try {
      const payload = {
        ...formData,
        patientId: user?.id || formData.patientId
      };

      await api.post('/Reservations', payload, token);
      setSuccess('Rezervacija uspešno kreirana!');
      setFormData({
        hospitalId: '',
        departmentId: '',
        patientId: user?.id || '',
        medicalServiceId: '',
        startsAtUtc: '',
        endsAtUtc: '',
        status: 'Pending'
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.message && err.message.includes('overlap')) {
        setError('Već imate aktivnu rezervaciju u ovom periodu');
      } else {
        setError('Greška pri kreiranju rezervacije');
      }
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
      Confirmed: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      Cancelled: { bg: '#fff2f0', color: '#cf1322', border: '#ffccc7' }
    };
    const icons = {
      Pending: <Clock size={14} />,
      Confirmed: <CheckCircle size={14} />,
      Cancelled: <XCircle size={14} />
    };
    const labels = {
      Pending: 'Na čekanju',
      Confirmed: 'Potvrđeno',
      Cancelled: 'Otkazano'
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
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'Pending').length,
    confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    cancelled: reservations.filter(r => r.status === 'Cancelled').length
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Moje rezervacije" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Moje rezervacije" />
      
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Moje rezervacije</h1>
            <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Pregledajte i upravljajte svojim terminima</p>
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
            <span>Nova rezervacija</span>
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
              <Calendar size={32} color="#1890ff" />
            </div>
          </div>
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
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#52c41a' }}>{stats.confirmed}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Potvrđeno</div>
              </div>
              <CheckCircle size={32} color="#52c41a" />
            </div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#cf1322' }}>{stats.cancelled}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Otkazano</div>
              </div>
              <XCircle size={32} color="#cf1322" />
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        {reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
            <Calendar size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema rezervacija</h3>
            <p style={{ color: '#8c8c8c' }}>Kreirajte prvu rezervaciju</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Bolnica
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Odeljenje
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Usluga
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Datum i vreme
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => {
                  const hospital = hospitals.find(h => h.id === reservation.hospitalId);
                  const department = departments.find(d => d.id === reservation.departmentId);
                  const service = services.find(s => s.id === reservation.medicalServiceId);
                  return (
                    <tr key={reservation.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
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
                            <Hospital size={20} color="#1890ff" />
                          </div>
                          <span style={{ fontWeight: 500, color: '#262626' }}>{hospital?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Activity size={16} color="#8c8c8c" />
                          <span style={{ color: '#595959', fontSize: '0.875rem' }}>{department?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ color: '#262626', fontWeight: 500 }}>{service?.name || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div style={{ color: '#262626', fontWeight: 500 }}>
                            {new Date(reservation.startsAtUtc).toLocaleDateString('sr-RS')}
                          </div>
                          <div style={{ color: '#8c8c8c', marginTop: '0.25rem' }}>
                            {new Date(reservation.startsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })} - {new Date(reservation.endsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(reservation.status)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Nova rezervacija</h2>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Odeljenje</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Izaberite odeljenje</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Medicinska usluga</label>
                <select
                  value={formData.medicalServiceId}
                  onChange={(e) => setFormData({ ...formData, medicalServiceId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Izaberite uslugu</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Početak</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAtUtc}
                    onChange={(e) => setFormData({ ...formData, startsAtUtc: e.target.value })}
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
                    type="datetime-local"
                    value={formData.endsAtUtc}
                    onChange={(e) => setFormData({ ...formData, endsAtUtc: e.target.value })}
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
              <div style={{
                padding: '1rem',
                background: '#f0f5ff',
                border: '1px solid #adc6ff',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: '#1890ff'
              }}>
                <strong>Napomena:</strong> Možete imati samo jednu aktivnu rezervaciju u istom periodu.
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
                  Rezerviši
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;