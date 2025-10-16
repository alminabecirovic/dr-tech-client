import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Edit, User, Stethoscope, AlertTriangle } from 'lucide-react';

const Appointments = () => {
  const { token, hasRole } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  
  const [formData, setFormData] = useState({
    hospitalId: '',
    departmentId: '',
    doctorId: '',
    patientId: '',
    startsAtUtc: '',
    endsAtUtc: '',
    type: 'exam',
    notes: '',
    medicalServiceId: '',
    status: 'Scheduled',
    isConfirmed: false,
    rescheduleCount: 0,
    requiredEquipmentIds: []
  });

  const [rescheduleData, setRescheduleData] = useState({
    newStartsAtUtc: '',
    newEndsAtUtc: ''
  });

  const [cancelData, setCancelData] = useState({
    reason: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Provera da li je korisnik HospitalAdmin ili Doctor
  const isHospitalAdmin = hasRole('HospitalAdmin');
  const isDoctor = hasRole('Doctor');
  const canAccess = isHospitalAdmin || isDoctor;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appts, hosps, depts, docs, pats, servs] = await Promise.all([
        api.getAppointments(token),
        api.getHospitals(token),
        api.getDepartments(token),
        api.getDoctors(token).catch(() => []),
        api.getPatients(token).catch(() => []),
        api.getServices(token).catch(() => [])
      ]);
      
      setAppointments(appts || []);
      setHospitals(hosps || []);
      setDepartments(depts || []);
      setDoctors(docs || []);
      setPatients(pats || []);
      setServices(servs || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.hospitalId || !formData.departmentId || !formData.doctorId || !formData.patientId || !formData.medicalServiceId) {
      setError('Sva polja su obavezna');
      return;
    }

    if (new Date(formData.startsAtUtc) >= new Date(formData.endsAtUtc)) {
      setError('Početno vreme mora biti pre krajnjeg vremena');
      return;
    }

    try {
      console.log('Sending appointment data:', formData);
      const response = await api.createAppointment(formData, token);
      console.log('Response:', response);
      setSuccess('Termin uspešno kreiran!');
      setFormData({
        hospitalId: '',
        departmentId: '',
        doctorId: '',
        patientId: '',
        startsAtUtc: '',
        endsAtUtc: '',
        type: 'exam',
        notes: '',
        medicalServiceId: ''
      });
      setShowCreateModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri kreiranju termina');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.rescheduleAppointment(selectedAppointment.id, rescheduleData, token);
      
      const newCount = selectedAppointment.rescheduleCount + 1;
      if (newCount >= 2) {
        setSuccess('Termin pomeren! Pacijent dobija automatski popust zbog višestrukog pomeranja.');
      } else {
        setSuccess('Termin uspešno pomeren!');
      }
      
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri pomeranju termina');
    }
  };

  const handleConfirm = async (appointment) => {
    try {
      await api.confirmAppointment(appointment.id, token);
      setSuccess('Termin uspešno potvrđen!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri potvrđivanju termina');
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.cancelAppointment(selectedAppointment.id, cancelData, token);
      setSuccess('Termin uspešno otkazan!');
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelData({ reason: '' });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri otkazivanju termina');
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    const start = new Date(appointment.startsAtUtc);
    start.setDate(start.getDate() + 1);
    const end = new Date(appointment.endsAtUtc);
    end.setDate(end.getDate() + 1);
    
    setRescheduleData({
      newStartsAtUtc: start.toISOString().slice(0, 16),
      newEndsAtUtc: end.toISOString().slice(0, 16)
    });
    setShowRescheduleModal(true);
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelData({ reason: '' });
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Scheduled': { bg: '#bee3f8', color: '#2c5282' },
      'Confirmed': { bg: '#c6f6d5', color: '#22543d' },
      'Cancelled': { bg: '#fed7d7', color: '#742a2a' },
      'Completed': { bg: '#e2e8f0', color: '#2d3748' }
    };
    const style = colors[status] || colors['Scheduled'];
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        background: style.bg,
        color: style.color
      }}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const labels = {
      'exam': 'Pregled',
      'surgery': 'Operacija',
      'lab': 'Laboratorija'
    };
    return labels[type] || type;
  };

  const getServiceName = (id) => {
    const service = services.find(s => s.id === id);
    return service ? service.name : 'N/A';
  };

  const getDoctorName = (id) => {
    const doc = doctors.find(d => d.id === id);
    return doc ? doc.fullName : 'Nepoznat';
  };

  const getPatientName = (id) => {
    const pat = patients.find(p => p.id === id);
    return pat ? pat.fullName : 'Nepoznat';
  };

  const getHospitalName = (id) => {
    const hosp = hospitals.find(h => h.id === id);
    return hosp ? hosp.name : 'Nepoznata';
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Termini" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  // Ako korisnik nije HospitalAdmin niti Doctor, prikaži poruku
  if (!canAccess) {
    return (
      <div>
        <Navbar title="Termini" />
        <div className="page-content">
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fc8181',
            color: '#742a2a',
            padding: '24px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
            <h3>Nemate pristup ovoj stranici</h3>
            <p style={{ marginTop: '8px' }}>Samo administratori bolnice i doktori mogu pristupiti terminima.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Termini" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div className="page-header">
          <div>
            <h2>Upravljanje Terminima</h2>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Zakazivanje i upravljanje pregledima i operacijama
            </p>
          </div>
          {(isHospitalAdmin || isDoctor) && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              Zakaži Termin
            </button>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} color="#cbd5e0" />
            <h3>Nema termina</h3>
            <p>Kliknite na "Zakaži Termin" da dodate prvi termin</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Datum i Vreme</th>
                  <th>Tip</th>
                  <th>Pacijent</th>
                  <th>Doktor</th>
                  <th>Usluga</th>
                  <th>Status</th>
                  <th>Pomeranja</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} style={{ 
                    background: appt.rescheduleCount >= 2 ? '#fff5f5' : 'white' 
                  }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#718096" />
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {new Date(appt.startsAtUtc).toLocaleDateString('sr-RS')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>
                            {new Date(appt.startsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(appt.endsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getTypeBadge(appt.type)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="#718096" />
                        {getPatientName(appt.patientId)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Stethoscope size={16} color="#718096" />
                        {getDoctorName(appt.doctorId)}
                      </div>
                    </td>
                    <td>{getServiceName(appt.medicalServiceId)}</td>
                    <td>{getStatusBadge(appt.status)}</td>
                    <td>
                      {appt.rescheduleCount >= 2 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e53e3e' }}>
                          <AlertTriangle size={16} />
                          {appt.rescheduleCount}x
                        </div>
                      ) : (
                        <span>{appt.rescheduleCount}x</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {appt.status === 'Scheduled' && !appt.isConfirmed && isHospitalAdmin && (
                          <button 
                            className="btn-icon btn-success" 
                            onClick={() => handleConfirm(appt)}
                            title="Potvrdi"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && appt.status !== 'Completed' && isHospitalAdmin && (
                          <>
                            <button 
                              className="btn-icon btn-warning" 
                              onClick={() => openRescheduleModal(appt)}
                              title="Pomeri"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="btn-icon btn-danger" 
                              onClick={() => openCancelModal(appt)}
                              title="Otkaži"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Zakaži Novi Termin</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Bolnica *</label>
                  <select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                    required
                  >
                    <option value="">Izaberite bolnicu</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Odeljenje *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    required
                  >
                    <option value="">Izaberite odeljenje</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Doktor *</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    required
                  >
                    <option value="">Izaberite doktora</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.fullName} - {d.specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Pacijent *</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    required
                  >
                    <option value="">Izaberite pacijenta</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Početak *</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAtUtc}
                    onChange={(e) => setFormData({...formData, startsAtUtc: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Kraj *</label>
                  <input
                    type="datetime-local"
                    value={formData.endsAtUtc}
                    onChange={(e) => setFormData({...formData, endsAtUtc: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Usluga *</label>
                <select
                  value={formData.medicalServiceId}
                  onChange={(e) => setFormData({ ...formData, medicalServiceId: e.target.value })}
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
                <label>Tip Termina *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="exam">Pregled</option>
                  <option value="surgery">Operacija</option>
                  <option value="lab">Laboratorijska Analiza</option>
                </select>
              </div>

              <div className="form-group">
                <label>Napomena</label>
                <textarea
                  placeholder="Dodatne informacije..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Zakaži Termin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pomeri Termin</h2>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>×</button>
            </div>

            {selectedAppointment?.rescheduleCount >= 1 && (
              <div style={{ padding: '12px 24px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px', margin: '0 24px 16px', color: '#742a2a' }}>
                <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                <strong>Upozorenje:</strong> Ovo je već {selectedAppointment.rescheduleCount}. pomeranje. 
                {selectedAppointment.rescheduleCount >= 1 && ' Još jedno pomeranje će automatski dodeliti popust pacijentu.'}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group">
                <label>Novi Početak *</label>
                <input
                  type="datetime-local"
                  value={rescheduleData.newStartsAtUtc}
                  onChange={(e) => setRescheduleData({...rescheduleData, newStartsAtUtc: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Novi Kraj *</label>
                <input
                  type="datetime-local"
                  value={rescheduleData.newEndsAtUtc}
                  onChange={(e) => setRescheduleData({...rescheduleData, newEndsAtUtc: e.target.value})}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Pomeri Termin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Otkaži Termin</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCancelSubmit}>
              <div className="form-group">
                <label>Razlog Otkazivanja *</label>
                <textarea
                  placeholder="Unesite razlog otkazivanja termina..."
                  value={cancelData.reason}
                  onChange={(e) => setCancelData({...cancelData, reason: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Zatvori
                </button>
                <button type="submit" className="btn btn-danger">Otkaži Termin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-icon {
          padding: 6px;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #edf2f7;
        }

        .btn-success { border-color: #48bb78; color: #48bb78; }
        .btn-success:hover { background: #c6f6d5; }

        .btn-warning { border-color: #ed8936; color: #ed8936; }
        .btn-warning:hover { background: #feebc8; }

        .btn-danger { border-color: #f56565; color: #f56565; }
        .btn-danger:hover { background: #fed7d7; }

        .btn.btn-danger {
          background: #f56565;
          color: white;
        }

        .btn.btn-danger:hover {
          background: #e53e3e;
        }

        .modal-large {
          max-width: 800px;
        }
      `}</style>
    </div>
  );
};

export default Appointments;