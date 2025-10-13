import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import HospitalForm from './HospitalForm';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const HospitalList = () => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const data = await api.get('/Hospitals', token);
      setHospitals(data);
    } catch (error) {
      console.error('Failed to load hospitals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovu bolnicu?')) {
      return;
    }

    try {
      await api.delete(`/Hospitals/${id}`, token);
      loadHospitals();
    } catch (error) {
      alert('Greška pri brisanju bolnice');
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingHospital(null);
    setShowModal(true);
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="data-table">
        <div className="table-header">
          <h2>Lista bolnica</h2>
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
              Dodaj bolnicu
            </button>
          </div>
        </div>

        {filteredHospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema bolnica. Kliknite "Dodaj bolnicu" da kreirate novu.
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
              {filteredHospitals.map((hospital) => (
                <tr key={hospital.id}>
                  <td>{hospital.name}</td>
                  <td>{hospital.city}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(hospital)}
                        title="Izmeni"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(hospital.id)}
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
        <HospitalForm
          hospital={editingHospital}
          onClose={() => {
            setShowModal(false);
            setEditingHospital(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingHospital(null);
            loadHospitals();
          }}
        />
      )}
    </div>
  );
};

export default HospitalList;