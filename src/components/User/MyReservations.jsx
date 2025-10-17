import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Calendar, Plus, Hospital, Activity, Clock, CheckCircle, XCircle, AlertCircle, Stethoscope } from 'lucide-react';

const MyReservations = () => {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: '',
    departmentId: '',
    doctorId: '',
    medicalServiceId: '',
    startsAtUtc: '',
    endsAtUtc: '',
    type: 'Consultation',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, hospitalsData, departmentsData, doctorsData, servicesData] = await Promise.all([
        api.get('/User/appointments', token),
        api.get('/Hospitals', token),
        api.get('/Departments', token),
        api.get('/Doctors', token),
        api.get('/User/services', token).catch(() => [])
      ]);

      setAppointments(appointmentsData || []);
      setHospitals(hospitalsData || []);
      setDepartments(departmentsData || []);
      setDoctors(doctorsData || []);
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

    if (!formData.hospitalId || !formData.departmentId || !formData.doctorId || !formData.startsAtUtc || !formData.endsAtUtc) {
      setError('Sva obavezna polja moraju biti popunjena');
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
      await api.post('/User/request-appointment', formData, token);
      
      setSuccess('Zahtev za termin uspešno poslat!');
      setFormData({
        hospitalId: '',
        departmentId: '',
        doctorId: '',
        medicalServiceId: '',
        startsAtUtc: '',
        endsAtUtc: '',
        type: 'Consultation',
        notes: ''
      });
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.message && err.message.includes('overlap')) {
        setError('Već imate aktivan termin u ovom periodu');
      } else {
        setError('Greška pri kreiranju zahteva za termin');
      }
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Requested: { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
      Scheduled: { bg: '#f0f5ff', color: '#1890ff', border: '#adc6ff' },
      Confirmed: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      Cancelled: { bg: '#fff2f0', color: '#cf1322', border: '#ffccc7' },
      Completed: { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' }
    };
    const icons = {
      Requested: <Clock size={14} />,
      Scheduled: <Calendar size={14} />,
      Confirmed: <CheckCircle size={14} />,
      Cancelled: <XCircle size={14} />,
      Completed: <CheckCircle size={14} />
    };
    const labels = {
      Requested: 'Zahtevano',
      Scheduled: 'Zakazano',
      Confirmed: 'Potvrđeno',
      Cancelled: 'Otkazano',
      Completed: 'Završeno'
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

  const stats = {
    total: appointments.length,
    requested: appointments.filter(a => a.status === 'Requested').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Moji termini" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Moji termini" />
      
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>Moji termini</h1>
            <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>Pregledajte i upravljajte svojim zakazanim terminima</p>
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
            <span>Zahtevaj termin</span>
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
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fa8c16' }}>{stats.requested}</div>
                <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Zahtevano</div>
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

        {/* Appointments Table */}
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
            <Calendar size={64} color="#d9d9d9" />
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema termina</h3>
            <p style={{ color: '#8c8c8c' }}>Zahtevajte prvi termin</p>
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
                    Doktor
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Datum i vreme
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Tip
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const hospital = hospitals.find(h => h.id === appointment.hospitalId);
                  const department = departments.find(d => d.id === appointment.departmentId);
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  
                  return (
                    <tr key={appointment.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Stethoscope size={16} color="#8c8c8c" />
                          <span style={{ color: '#595959', fontSize: '0.875rem' }}>Dr. {doctor?.fullName || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div style={{ color: '#262626', fontWeight: 500 }}>
                            {new Date(appointment.startsAtUtc).toLocaleDateString('sr-RS')}
                          </div>
                          <div style={{ color: '#8c8c8c', marginTop: '0.25rem' }}>
                            {new Date(appointment.startsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: '#f0f5ff',
                          color: '#1890ff',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {appointment.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(appointment.status)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>Zahtev za termin</h2>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Bolnica *</label>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Odeljenje *</label>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Doktor *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Izaberite doktora</option>
                  {doctors.filter(d => !formData.departmentId || d.departmentId === formData.departmentId).map(doctor => (
                    <option key={doctor.id} value={doctor.id}>Dr. {doctor.fullName}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Medicinska usluga (opciono)</label>
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
                >
                  <option value="">Izaberite uslugu (opciono)</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tip *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="Consultation">Konsultacija</option>
                  <option value="Checkup">Pregled</option>
                  <option value="Procedure">Procedura</option>
                  <option value="Surgery">Operacija</option>
                  <option value="Emergency">Hitno</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Početak *</label>
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kraj *</label>
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Napomene</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dodatne napomene..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
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
                <strong>Napomena:</strong> Možete imati samo jedan aktivan termin u istom periodu.
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
                  Zahtevaj termin
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