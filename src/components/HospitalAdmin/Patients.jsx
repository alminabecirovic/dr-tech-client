import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { User, AlertCircle, FileText } from 'lucide-react';

const Patients = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getPatients(token);
      setPatients(data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setError('Greška pri učitavanju pacijenata');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Pacijenti" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Pacijenti" />

      <div className="page-content">
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="page-header">
          <div>
            <h2>Pregled Pacijenata</h2>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Lista svih pacijenata u sistemu
            </p>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="empty-state">
            <User size={64} color="#cbd5e0" />
            <h3>Nema pacijenata</h3>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Ime i Prezime</th>
                  <th>Broj Osiguranja</th>
                  <th>Alergije</th>
                  <th>Trenutna Terapija</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={20} color="#667eea" />
                        <strong>{patient.fullName}</strong>
                      </div>
                    </td>
                    <td>{patient.insuranceNumber}</td>
                    <td>
                      {patient.allergies ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e53e3e' }}>
                          <AlertCircle size={14} />
                          {patient.allergies}
                        </div>
                      ) : (
                        <span style={{ color: '#a0aec0' }}>Nema</span>
                      )}
                    </td>
                    <td>
                      {patient.currentTherapies ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={14} />
                          {patient.currentTherapies.substring(0, 30)}
                          {patient.currentTherapies.length > 30 && '...'}
                        </div>
                      ) : (
                        <span style={{ color: '#a0aec0' }}>Nema</span>
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
        .data-table {
          margin-top: 24px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
        }

        th, td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }

        th {
          background: #f7fafc;
          color: #4a5568;
          font-weight: 600;
        }

        tr:hover {
          background: #f9fafb;
        }

        .empty-state {
          text-align: center;
          color: #718096;
          margin-top: 60px;
        }

        .error-message {
          color: #e53e3e;
          background: #fed7d7;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Patients;
