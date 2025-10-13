import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import PatientForm from './PatientForm';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const PatientList = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await api.get('/Patients', token);
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovog pacijenta?')) {
      return;
    }

    try {
      await api.delete(`/Patients/${id}`, token);
      loadPatients();
    } catch (error) {
      alert('Greška pri brisanju pacijenta');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.insuranceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="data-table">
        <div className="table-header">
          <h2>Lista pacijenata</h2>
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
              Dodaj pacijenta
            </button>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema pacijenata. Kliknite "Dodaj pacijenta" da kreirate novog.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ime i prezime</th>
                <th>Broj osiguranja</th>
                <th>Alergije</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.fullName}</td>
                  <td>{patient.insuranceNumber}</td>
                  <td>{patient.allergies || 'Nema'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(patient)}
                        title="Izmeni"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(patient.id)}
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
        <PatientForm
          patient={editingPatient}
          onClose={() => {
            setShowModal(false);
            setEditingPatient(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingPatient(null);
            loadPatients();
          }}
        />
      )}
    </div>
  );
};

export default PatientList;