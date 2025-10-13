import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import { Plus, Search } from 'lucide-react';

const ReservationList = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await api.get('/Reservations', token);
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#52c41a';
      case 'Pending': return '#faad14';
      case 'Cancelled': return '#f5222d';
      default: return '#8c8c8c';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'Confirmed': return 'Potvrđeno';
      case 'Pending': return 'Na čekanju';
      case 'Cancelled': return 'Otkazano';
      default: return status;
    }
  };

  const filteredReservations = reservations.filter(res =>
    res.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Rezervacije" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Rezervacije" />

      <div className="data-table">
        <div className="table-header">
          <h2>Lista rezervacija</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-box">
              <Search size={20} color="#718096" />
              <input
                type="text"
                placeholder="Pretraži po statusu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary">
              <Plus size={20} style={{ marginRight: '8px' }} />
              Nova rezervacija
            </button>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema rezervacija.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Datum početka</th>
                <th>Datum završetka</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{new Date(reservation.startsAtUtc).toLocaleString('sr-RS')}</td>
                  <td>{new Date(reservation.endsAtUtc).toLocaleString('sr-RS')}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: getStatusColor(reservation.status) + '20',
                      color: getStatusColor(reservation.status),
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReservationList;