import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import DoctorForm from './DoctorForm';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const DoctorList = () => {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await api.get('/Doctors', token);
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovog doktora?')) {
      return;
    }

    try {
      await api.delete(`/Doctors/${id}`, token);
      loadDoctors();
    } catch (error) {
      alert('Greška pri brisanju doktora');
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingDoctor(null);
    setShowModal(true);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Doktori" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Doktori" />

      <div className="data-table">
        <div className="table-header">
          <h2>Lista doktora</h2>
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
              Dodaj doktora
            </button>
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema doktora. Kliknite "Dodaj doktora" da kreirate novog.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ime i prezime</th>
                <th>Specijalnost</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.fullName}</td>
                  <td>{doctor.specialty}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(doctor)}
                        title="Izmeni"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(doctor.id)}
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
        <DoctorForm
          doctor={editingDoctor}
          onClose={() => {
            setShowModal(false);
            setEditingDoctor(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingDoctor(null);
            loadDoctors();
          }}
        />
      )}
    </div>
  );
};

export default DoctorList;