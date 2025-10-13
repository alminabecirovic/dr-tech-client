import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import { Plus, Search } from 'lucide-react';

const DepartmentList = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.get('/Departments', token);
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Odeljenja" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Odeljenja" />

      <div className="data-table">
        <div className="table-header">
          <h2>Lista odeljenja</h2>
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
            <button className="btn btn-primary">
              <Plus size={20} style={{ marginRight: '8px' }} />
              Dodaj odeljenje
            </button>
          </div>
        </div>

        {filteredDepartments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema odeljenja.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Broj doktora</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.name}</td>
                  <td>{dept.doctorsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DepartmentList;