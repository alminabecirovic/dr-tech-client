import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Hospital, Users, Stethoscope, Calendar, Building2, FileText, CreditCard, Shield, TrendingUp } from 'lucide-react';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { token, user, hasRole } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      if (hasRole('HospitalAdmin')) {
        await loadHospitalAdminStats();
      } else if (hasRole('Doctor')) {
        await loadDoctorStats();
      } else if (hasRole('InsuranceAgency')) {
        await loadInsuranceAgencyStats();
      } else if (hasRole('InsuredUser')) {
        await loadInsuredUserStats();
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitalAdminStats = async () => {
    const [hospitals, doctors, patients, appointments, equipment] = await Promise.all([
      api.get('/Hospitals', token),
      api.get('/Doctors', token),
      api.get('/Patients', token),
      api.get('/Appointment', token).catch(() => []),
      api.get('/Equipment', token).catch(() => [])
    ]);

    setStats({
      hospitals: hospitals.length,
      doctors: doctors.length,
      patients: patients.length,
      appointments: appointments.length,
      equipment: equipment.length,
      operationalEquipment: equipment.filter(e => e.status === 'Operational').length
    });
  };

  const loadDoctorStats = async () => {
    const [patients, appointments] = await Promise.all([
      api.get('/Patients', token).catch(() => []),
      api.get('/Appointment', token).catch(() => [])
    ]);

    setStats({
      patients: patients.length,
      appointments: appointments.length,
      todayAppointments: appointments.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.startsAtUtc).toDateString() === today;
      }).length
    });
  };

  const loadInsuranceAgencyStats = async () => {
    const [agencies, contracts, payments] = await Promise.all([
      api.get('/Agencies', token).catch(() => []),
      api.get('/Contracts', token).catch(() => []),
      api.get('/Payments', token).catch(() => [])
    ]);

    setStats({
      agencies: agencies.length,
      contracts: contracts.length,
      activeContracts: contracts.filter(c => c.status === 'Accepted').length,
      payments: payments.length,
      confirmedPayments: payments.filter(p => p.confirmed).length
    });
  };

  const loadInsuredUserStats = async () => {
    const [reservations, payments] = await Promise.all([
      api.get('/Reservations', token).catch(() => []),
      api.get('/Payments', token).catch(() => [])
    ]);

    setStats({
      reservations: reservations.length,
      activeReservations: reservations.filter(r => r.status === 'Confirmed').length,
      payments: payments.length,
      pendingPayments: payments.filter(p => !p.confirmed).length
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Dashboard" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Dashboard" />

      {hasRole('HospitalAdmin') && <HospitalAdminDashboard stats={stats} />}
      {hasRole('Doctor') && <DoctorDashboard stats={stats} />}
      {hasRole('InsuranceAgency') && <InsuranceAgencyDashboard stats={stats} />}
      {hasRole('InsuredUser') && <InsuredUserDashboard stats={stats} />}
    </div>
  );
};

const HospitalAdminDashboard = ({ stats }) => (
  <div className="dashboard-container">
    <div className="dashboard-welcome">
      <div className="welcome-content">
        <h1 className="welcome-title">Dobrodošli</h1>
      </div>
      <div className="welcome-icon">
        <Hospital size={48} color="#1890ff" strokeWidth={1.5} />
      </div>
    </div>

    <div className="stats-grid">
      <StatCard
        icon={Stethoscope}
        label="Ukupno doktora"
        value={stats.doctors}
        color="#597ef7"
      />
      <StatCard
        icon={Users}
        label="Ukupno pacijenata"
        value={stats.patients}
        color="#fa8c16"
      />
      <StatCard
        icon={Calendar}
        label="Ukupno termina"
        value={stats.appointments}
        color="#52c41a"
      />
      <StatCard
        icon={Shield}
        label="Oprema (ispravna)"
        value={`${stats.operationalEquipment}/${stats.equipment}`}
        color="#722ed1"
      />
    </div>
  </div>
);

const DoctorDashboard = ({ stats }) => (
  <div className="dashboard-container">
    <div className="dashboard-welcome">
      <div className="welcome-content">
        <h1 className="welcome-title">Dobrodošli, Doktore</h1>
        <p className="welcome-subtitle">
          Pregledajte svoje termine, pacijente i dostupnu opremu
        </p>
      </div>
      <div className="welcome-icon">
        <Stethoscope size={48} color="#597ef7" strokeWidth={1.5} />
      </div>
    </div>

    <div className="stats-grid">
      <StatCard
        icon={Users}
        label="Ukupno pacijenata"
        value={stats.patients}
        color="#fa8c16"
        trend="+3 nova"
      />
      <StatCard
        icon={Calendar}
        label="Svi termini"
        value={stats.appointments}
        color="#52c41a"
        trend="Ovaj mesec"
      />
      <StatCard
        icon={Calendar}
        label="Današnji termini"
        value={stats.todayAppointments}
        color="#1890ff"
        trend="U toku"
        highlight
      />
    </div>
  </div>
);

const InsuranceAgencyDashboard = ({ stats }) => (
  <div className="dashboard-container">
    <div className="dashboard-welcome">
      <div className="welcome-content">
        <h1 className="welcome-title">Dobrodošli</h1>
      </div>
      <div className="welcome-icon">
        <Building2 size={48} color="#1890ff" strokeWidth={1.5} />
      </div>
    </div>

    <div className="stats-grid">
      <StatCard
        icon={Building2}
        label="Agencije"
        value={stats.agencies}
        color="#1890ff"
        trend="Aktivno"
      />
      <StatCard
        icon={FileText}
        label="Ukupno ugovora"
        value={stats.contracts}
        color="#597ef7"
        trend="+8 ovog meseca"
      />
      <StatCard
        icon={FileText}
        label="Aktivni ugovori"
        value={stats.activeContracts}
        color="#52c41a"
        trend="U statusu"
        highlight
      />
      <StatCard
        icon={CreditCard}
        label="Ukupno plaćanja"
        value={stats.payments}
        color="#fa8c16"
        trend="Sva plaćanja"
      />
      <StatCard
        icon={CreditCard}
        label="Potvrđena plaćanja"
        value={stats.confirmedPayments}
        color="#722ed1"
        trend="Procesuirano"
      />
    </div>
  </div>
);

const InsuredUserDashboard = ({ stats }) => (
  <div className="dashboard-container">
    <div className="dashboard-welcome">
      <div className="welcome-content">
        <h1 className="welcome-title">Dobrodošli</h1>
      </div>
      <div className="welcome-icon">
        <Users size={48} color="#52c41a" strokeWidth={1.5} />
      </div>
    </div>

    <div className="stats-grid">
      <StatCard
        icon={Calendar}
        label="Moje rezervacije"
        value={stats.reservations}
        color="#1890ff"
        trend="Svih vremena"
      />
      <StatCard
        icon={Calendar}
        label="Aktivne rezervacije"
        value={stats.activeReservations}
        color="#52c41a"
        trend="Potvrđeno"
        highlight
      />
      <StatCard
        icon={CreditCard}
        label="Ukupno plaćanja"
        value={stats.payments}
        color="#fa8c16"
        trend="Završeno"
      />
      <StatCard
        icon={CreditCard}
        label="Na čekanju"
        value={stats.pendingPayments}
        color="#faad14"
        trend="Za obradu"
        highlight
      />
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, trend, highlight }) => (
  <div className={`stat-card-modern ${highlight ? 'stat-card-highlight' : ''}`}>
    <div className="stat-card-header">
      <div className="stat-icon-modern" style={{
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        borderLeft: `3px solid ${color}`
      }}>
        <Icon size={24} color={color} strokeWidth={2} />
      </div>
    </div>
    <div className="stat-body">
      <div className="stat-value-modern">{value}</div>
      <div className="stat-label-modern">{label}</div>
      {trend && (
        <div className="stat-trend" style={{ color: color }}>
          <TrendingUp size={14} strokeWidth={2} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;
