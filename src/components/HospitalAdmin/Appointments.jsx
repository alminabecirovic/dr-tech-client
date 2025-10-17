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
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState('');

  // Reschedule controls (mirror the create flow)
  const [rescheduleDurationMinutes, setRescheduleDurationMinutes] = useState(60);
  const [rescheduleSelectedDate, setRescheduleSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [rescheduleAvailableSlots, setRescheduleAvailableSlots] = useState([]);
  const [rescheduleSelectedSlotIndex, setRescheduleSelectedSlotIndex] = useState('');
  
  
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

  const toUtcIsoString = (localDateTimeString) => {
    if (!localDateTimeString) return '';
    const date = new Date(localDateTimeString);
    return date.toISOString();
  };

  const intervalsOverlap = (aStartMs, aEndMs, bStartMs, bEndMs) => {
    return aStartMs < bEndMs && aEndMs > bStartMs;
  };

  const computeAvailableSlots = (doctorAppts, localDateString, slotMinutes) => {
    if (!localDateString || !slotMinutes) return [];
    const [year, month, day] = localDateString.split('-').map(Number);
    const windowStart = new Date(year, month - 1, day, 8, 0, 0, 0);
    const windowEnd = new Date(year, month - 1, day, 18, 0, 0, 0);

    const busyIntervals = (doctorAppts || [])
      .filter(a => ['Scheduled', 'Confirmed'].includes(a.status))
      .map(a => ({
        start: new Date(a.startsAtUtc),
        end: new Date(a.endsAtUtc)
      }))
      .filter(({ start, end }) => start < windowEnd && end > windowStart)
      .sort((x, y) => x.start - y.start);

    const slots = [];
    let cursor = new Date(windowStart);
    const slotMs = slotMinutes * 60 * 1000;

    const isFree = (start, end) => {
      const startMs = start.getTime();
      const endMs = end.getTime();
      return !busyIntervals.some(({ start: bS, end: bE }) => intervalsOverlap(startMs, endMs, bS.getTime(), bE.getTime()));
    };

    while (cursor.getTime() + slotMs <= windowEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + slotMs);
      if (isFree(slotStart, slotEnd)) {
        const label = `${slotStart.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })} - ${slotEnd.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`;
        const toLocalInput = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        slots.push({
          startLocal: toLocalInput(slotStart),
          endLocal: toLocalInput(slotEnd),
          label
        });
      }
      // advance by 30 minutes grid
      cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
    }
    return slots;
  };

  // Recompute available slots when doctor, date, or duration changes
  useEffect(() => {
    const updateSlots = async () => {
      try {
        if (!formData.doctorId) { setAvailableSlots([]); return; }
        const localDateString = selectedDate;
        const doctorAppts = await api.getAppointmentsByDoctor(formData.doctorId, token).catch(() => []);
        const slots = computeAvailableSlots(doctorAppts, localDateString, durationMinutes);
        setAvailableSlots(slots);
        setSelectedSlotIndex('');
      } catch (_e) {
        setAvailableSlots([]);
      }
    };
    updateSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctorId, selectedDate, durationMinutes]);

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

    if (!formData.startsAtUtc || !formData.endsAtUtc) {
      setError('Molimo izaberite slobodan termin');
      return;
    }

    if (new Date(formData.startsAtUtc) >= new Date(formData.endsAtUtc)) {
      setError('Početno vreme mora biti pre krajnjeg vremena');
      return;
    }

    try {
      // Convert times to UTC ISO strings with Z
      const startUtcIso = toUtcIsoString(formData.startsAtUtc);
      const endUtcIso = toUtcIsoString(formData.endsAtUtc);

      // Pre-check overlap using doctor's existing appointments
      const doctorAppointments = await api.getAppointmentsByDoctor(formData.doctorId, token).catch(() => []);

      const startMs = new Date(startUtcIso).getTime();
      const endMs = new Date(endUtcIso).getTime();

      const blockingStatuses = ['Scheduled', 'Confirmed'];
      const hasOverlap = (doctorAppointments || []).some((appt) => {
        if (!blockingStatuses.includes(appt.status)) return false;
        const apptStartMs = new Date(appt.startsAtUtc).getTime();
        const apptEndMs = new Date(appt.endsAtUtc).getTime();
        return intervalsOverlap(startMs, endMs, apptStartMs, apptEndMs);
      });

      if (hasOverlap) {
        setError('Izabrani termin se preklapa sa postojećim terminom doktora. Izaberite drugo vreme.');
        return;
      }

      const payload = {
        ...formData,
        startsAtUtc: startUtcIso,
        endsAtUtc: endUtcIso
      };

      console.log('Sending appointment data:', payload);
      const response = await api.createAppointment(payload, token);
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
      // Basic validation
      if (!rescheduleData.newStartsAtUtc || !rescheduleData.newEndsAtUtc) {
        setError('Molimo izaberite novi početak i kraj termina.');
        return;
      }

      const localStart = new Date(rescheduleData.newStartsAtUtc);
      const localEnd = new Date(rescheduleData.newEndsAtUtc);
      if (localStart >= localEnd) {
        setError('Početno vreme mora biti pre krajnjeg vremena');
        return;
      }

      // Convert to UTC ISO strings before sending
      const newStartUtcIso = toUtcIsoString(rescheduleData.newStartsAtUtc);
      const newEndUtcIso = toUtcIsoString(rescheduleData.newEndsAtUtc);

      // Pre-check overlap against doctor's other appointments (exclude the current one)
      const doctorAppointments = await api.getAppointmentsByDoctor(selectedAppointment.doctorId, token).catch(() => []);
      const startMs = new Date(newStartUtcIso).getTime();
      const endMs = new Date(newEndUtcIso).getTime();
      const blockingStatuses = ['Scheduled', 'Confirmed'];
      const hasOverlap = (doctorAppointments || []).some((appt) => {
        if (appt.id === selectedAppointment.id) return false; // ignore self
        if (!blockingStatuses.includes(appt.status)) return false;
        const apptStartMs = new Date(appt.startsAtUtc).getTime();
        const apptEndMs = new Date(appt.endsAtUtc).getTime();
        return intervalsOverlap(startMs, endMs, apptStartMs, apptEndMs);
      });

      if (hasOverlap) {
        setError('Izabrani termin se preklapa sa drugim terminom doktora. Izaberite drugo vreme.');
        return;
      }

      await api.rescheduleAppointment(
        selectedAppointment.id,
        { newStartsAtUtc: newStartUtcIso, newEndsAtUtc: newEndUtcIso },
        token
      );
      
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
    // Initialize reschedule controls from the appointment
    const start = new Date(appointment.startsAtUtc);
    const localDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    setRescheduleSelectedDate(localDate);
    setRescheduleDurationMinutes(60);
    setRescheduleSelectedSlotIndex('');
    setRescheduleAvailableSlots([]);
    // Clear direct datetime-local fields; they will be set when a slot is selected
    setRescheduleData({ newStartsAtUtc: '', newEndsAtUtc: '' });
    setShowRescheduleModal(true);
  };

  // Recompute reschedule available slots when inputs change
  useEffect(() => {
    const updateRescheduleSlots = async () => {
      try {
        if (!selectedAppointment?.doctorId) { setRescheduleAvailableSlots([]); return; }
        const doctorAppts = await api.getAppointmentsByDoctor(selectedAppointment.doctorId, token).catch(() => []);
        const slots = computeAvailableSlots(doctorAppts, rescheduleSelectedDate, rescheduleDurationMinutes);
        setRescheduleAvailableSlots(slots);
        setRescheduleSelectedSlotIndex('');
      } catch (_e) {
        setRescheduleAvailableSlots([]);
      }
    };
    if (showRescheduleModal) {
      updateRescheduleSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRescheduleModal, selectedAppointment, rescheduleSelectedDate, rescheduleDurationMinutes]);

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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px', marginTop: '8px' }}>
                <div className="form-group">
                  <label>Datum</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Trajanje</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Dostupni Termini</label>
                  <select
                    value={selectedSlotIndex}
                    onChange={(e) => {
                      const idx = e.target.value;
                      setSelectedSlotIndex(idx);
                      const indexNum = Number(idx);
                      if (!isNaN(indexNum) && availableSlots[indexNum]) {
                        const chosen = availableSlots[indexNum];
                        setFormData({ ...formData, startsAtUtc: chosen.startLocal, endsAtUtc: chosen.endLocal });
                      } else {
                        setFormData({ ...formData, startsAtUtc: '', endsAtUtc: '' });
                      }
                    }}
                  >
                    <option value="">-- Izaberite slobodan termin --</option>
                    {availableSlots.map((s, i) => (
                      <option key={`${s.startLocal}-${i}`} value={i}>{s.label}</option>
                    ))}
                  </select>
                  {formData.doctorId && availableSlots.length === 0 && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>Nema slobodnih termina za izabrani datum i trajanje.</div>
                  )}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Dan</label>
                  <input
                    type="date"
                    value={rescheduleSelectedDate}
                    onChange={(e) => setRescheduleSelectedDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Trajanje</label>
                  <select
                    value={rescheduleDurationMinutes}
                    onChange={(e) => setRescheduleDurationMinutes(Number(e.target.value))}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Dostupni Termini</label>
                  <select
                    value={rescheduleSelectedSlotIndex}
                    onChange={(e) => {
                      const idx = e.target.value;
                      setRescheduleSelectedSlotIndex(idx);
                      const indexNum = Number(idx);
                      if (!isNaN(indexNum) && rescheduleAvailableSlots[indexNum]) {
                        const chosen = rescheduleAvailableSlots[indexNum];
                        setRescheduleData({ newStartsAtUtc: chosen.startLocal, newEndsAtUtc: chosen.endLocal });
                      } else {
                        setRescheduleData({ newStartsAtUtc: '', newEndsAtUtc: '' });
                      }
                    }}
                  >
                    <option value="">-- Izaberite slobodan termin --</option>
                    {rescheduleAvailableSlots.map((s, i) => (
                      <option key={`${s.startLocal}-${i}`} value={i}>{s.label}</option>
                    ))}
                  </select>
                  {selectedAppointment?.doctorId && rescheduleAvailableSlots.length === 0 && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>Nema slobodnih termina za izabrani dan i trajanje.</div>
                  )}
                </div>
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