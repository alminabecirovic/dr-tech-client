import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import { Hospital, Users, Stethoscope, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    hospitals: 0,
    doctors: 0,
    patients: 0,
    reservations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [hospitals, doctors, patients, reservations] = await Promise.all([
        api.get('/Hospitals', token),
        api.get('/Doctors', token),
        api.get('/Patients', token),
        api.get('/Reservations', token)
      ]);

      setStats({
        hospitals: hospitals.length,
        doctors: doctors.length,
        patients: patients.length,
        reservations: reservations.length
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
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
      
      <div className="dashboard">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e6f7ff' }}>
              <Hospital size={24} color="#1890ff" />
            </div>
          </div>
          <div className="stat-value">{stats.hospitals}</div>
          <div className="stat-label">Ukupno bolnica</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#f0f5ff' }}>
              <Stethoscope size={24} color="#597ef7" />
            </div>
          </div>
          <div className="stat-value">{stats.doctors}</div>
          <div className="stat-label">Ukupno doktora</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fff7e6' }}>
              <Users size={24} color="#fa8c16" />
            </div>
          </div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Ukupno pacijenata</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#f6ffed' }}>
              <Calendar size={24} color="#52c41a" />
            </div>
          </div>
          <div className="stat-value">{stats.reservations}</div>
          <div className="stat-label">Ukupno rezervacija</div>
        </div>
      </div>

      <div className="data-table">
        <h2>Dobrodošli u DrTech Healthcare System! 🏥</h2>
        <p style={{ color: '#718096', marginTop: '16px' }}>
          Koristite meni sa leve strane da upravljate bolnicama, doktorima, pacijentima i rezervacijama.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;