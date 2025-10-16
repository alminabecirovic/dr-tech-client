import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const MyAppointments = () => {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myDoctorId, setMyDoctorId] = useState(null);

  useEffect(() => {
    loadMyAppointments();
  }, [user]);

  const loadMyAppointments = async () => {
    try {
      setLoading(true);
      
      // 1. Učitaj sve doktore i pronađi moj doctorId
      const doctors = await api.getDoctors(token);
      const myDoctor = doctors.find(d => d.userId === user?.id);
      
      if (!myDoctor) {
        setError('Niste registrovani kao doktor u sistemu.');
        setLoading(false);
        return;
      }

      setMyDoctorId(myDoctor.id);

      // 2. Učitaj samo moje termine
      const [appointmentsData, patientsData] = await Promise.all([
        api.getAppointmentsByDoctor(myDoctor.id, token),
        api.getPatients(token).catch(() => [])
      ]);

      setAppointments(appointmentsData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setError('Greška pri učitavanju termina');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      await api.confirmAppointment(appointmentId, token);
      loadMyAppointments();
    } catch (error) {
      setError(error.message || 'Greška pri potvrđivanju termina');
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.fullName : 'Nepoznat pacijent';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Scheduled': { bg: '#bee3f8', color: '#2c5282', icon: Clock },
      'Confirmed': { bg: '#c6f6d5', color: '#22543d', icon: CheckCircle },
      'Cancelled': { bg: '#fed7d7', color: '#742a2a', icon: XCircle },
      'Completed': { bg: '#e2e8f0', color: '#2d3748', icon: CheckCircle }
    };
    const style = colors[status] || colors['Scheduled'];
    const Icon = style.icon;
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        background: style.bg,
        color: style.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Icon size={12} />
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

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(a => 
      new Date(a.startsAtUtc).toDateString() === today &&
      a.status !== 'Cancelled'
    );
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(a => 
      new Date(a.startsAtUtc) > now &&
      a.status !== 'Cancelled'
    ).sort((a, b) => new Date(a.startsAtUtc) - new Date(b.startsAtUtc));
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Moji Termini" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  if (error && !myDoctorId) {
    return (
      <div>
        <Navbar title="Moji Termini" />
        <div className="page-content">
          <div style={{
            background: '#fed7d7',
            border: '1px solid #fc8181',
            color: '#742a2a',
            padding: '16px 24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={24} />
            <div>
              <strong>Greška</strong>
              <p style={{ marginTop: '4px' }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todayAppointments = getTodayAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  return (
    <div>
      <Navbar title="Moji Termini" />

      <div className="page-content">
        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: '#bee3f820' }}>
                <Calendar size={24} color="#2c5282" />
              </div>
            </div>
            <div className="stat-value">{todayAppointments.length}</div>
            <div className="stat-label">Današnji Termini</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: '#c6f6d520' }}>
                <Clock size={24} color="#22543d" />
              </div>
            </div>
            <div className="stat-value">{upcomingAppointments.length}</div>
            <div className="stat-label">Nadolazeći Termini</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: '#e2e8f0' }}>
                <User size={24} color="#4a5568" />
              </div>
            </div>
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Ukupno Termina</div>
          </div>
        </div>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
              🔥 Današnji Termini
            </h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Vreme</th>
                    <th>Pacijent</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((appt) => (
                    <tr key={appt.id} style={{ background: '#fff5f5' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} color="#e53e3e" />
                          <strong>
                            {new Date(appt.startsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(appt.endsAtUtc).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="#718096" />
                          {getPatientName(appt.patientId)}
                        </div>
                      </td>
                      <td>{getTypeBadge(appt.type)}</td>
                      <td>{getStatusBadge(appt.status)}</td>
                      <td>
                        {appt.status === 'Scheduled' && !appt.isConfirmed && (
                          <button 
                            className="btn-sm btn-success"
                            onClick={() => handleConfirm(appt.id)}
                          >
                            <CheckCircle size={14} />
                            Potvrdi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Appointments */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
          📅 Svi Moji Termini
        </h3>
        
        {appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} color="#cbd5e0" />
            <h3>Nemate zakazanih termina</h3>
            <p>Vaši termini će se prikazati ovde kada budu zakazani</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Datum i Vreme</th>
                  <th>Pacijent</th>
                  <th>Tip</th>
                  <th>Status</th>
                  <th>Napomena</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
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
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="#718096" />
                        {getPatientName(appt.patientId)}
                      </div>
                    </td>
                    <td>{getTypeBadge(appt.type)}</td>
                    <td>{getStatusBadge(appt.status)}</td>
                    <td>
                      {appt.notes ? (
                        <span style={{ fontSize: '13px', color: '#4a5568' }}>
                          {appt.notes.substring(0, 40)}
                          {appt.notes.length > 40 && '...'}
                        </span>
                      ) : (
                        <span style={{ color: '#a0aec0', fontSize: '13px' }}>Nema napomene</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn-sm {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-success {
          background: #48bb78;
          color: white;
        }

        .btn-success:hover {
          background: #38a169;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(72, 187, 120, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MyAppointments;