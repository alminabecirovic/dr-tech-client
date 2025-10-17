import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Hospital as HospitalIcon, MapPin, Building2 } from 'lucide-react';

const Hospitals = () => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        const data = await api.getHospitals(token);
        setHospitals(data || []);
      } catch (err) {
        console.error('Failed to load hospitals:', err);
        setError('Greška pri učitavanju bolnica');
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, [token]);

  if (loading) {
    return (
      <div>
        <Navbar title="Bolnice" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Bolnice" />

      <div className="page-content">
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        {hospitals.length === 0 ? (
          <div className="empty-state">
            <HospitalIcon size={64} color="#cbd5e0" />
            <h3>Nema bolnica</h3>
            <p>Baza ne sadrži nijednu bolnicu</p>
          </div>
        ) : (
          <div className="hospitals-grid">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-card">
                <div className="hospital-card-header">
                  <HospitalIcon size={32} color="#667eea" />
                  <h3>{hospital.name}</h3>
                </div>
                <div className="hospital-card-body">
                  <div className="hospital-info">
                    <MapPin size={16} color="#718096" />
                    <span>{hospital.city}</span>
                  </div>
                  <div className="hospital-info">
                    <Building2 size={16} color="#718096" />
                    <span>{hospital.departments?.length || 0} odeljenja</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-content {
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .hospital-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .hospital-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f7fafc;
        }

        .hospital-card-header h3 {
          margin: 0;
          font-size: 18px;
          color: #2d3748;
        }

        .hospital-card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hospital-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          font-size: 14px;
        }

        .empty-state {
          text-align: center;
          padding: 64px 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state h3 {
          margin: 16px 0 8px;
          color: #2d3748;
        }

        .empty-state p {
          color: #718096;
        }

        .loading {
          text-align: center;
          padding: 64px 24px;
          color: #718096;
          font-size: 16px;
        }

        .error-message {
          background: #fed7d7;
          border: 1px solid #fc8181;
          color: #742a2a;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default Hospitals;
