import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import AgencyForm from './AgencyForm';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const AgencyList = () => {
  const { token } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      const data = await api.get('/Agencies', token);
      setAgencies(data);
    } catch (error) {
      console.error('Failed to load agencies', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovu agenciju?')) {
      return;
    }

    try {
      await api.delete(`/Agencies/${id}`, token);
      loadAgencies();
    } catch (error) {
      alert('Greška pri brisanju agencije');
    }
  };

  const handleEdit = (agency) => {
    setEditingAgency(agency);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingAgency(null);
    setShowModal(true);
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Osiguravajuće agencije" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Osiguravajuće agencije" />

      <div className="data-table">
        <div className="table-header">
          <h2>Lista osiguravajućih agencija</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-box">
              <Search size={20} color="#718096" />
              <input
                type="text"
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={20} style={{ marginRight: '8px' }} />
              Dodaj agenciju
            </button>
          </div>
        </div>

        {filteredAgencies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema agencija. Kliknite "Dodaj agenciju" da kreirate novu.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Grad</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgencies.map((agency) => (
                <tr key={agency.id}>
                  <td>{agency.name}</td>
                  <td>{agency.city}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(agency)}
                        title="Izmeni"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(agency.id)}
                        title="Obriši"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AgencyForm
          agency={editingAgency}
          onClose={() => {
            setShowModal(false);
            setEditingAgency(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAgency(null);
            loadAgencies();
          }}
        />
      )}
    </div>
  );
};

export default AgencyList;