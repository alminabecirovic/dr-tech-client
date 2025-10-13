import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import ContractForm from './ContractForm';
import { Plus, Edit, Search } from 'lucide-react';

const ContractList = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await api.get('/Contracts', token);
      setContracts(data);
    } catch (error) {
      console.error('Failed to load contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingContract(null);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted': return '#52c41a';
      case 'Proposed': return '#faad14';
      case 'Rejected': return '#f5222d';
      default: return '#8c8c8c';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'Accepted': return 'Prihvaćen';
      case 'Proposed': return 'Predložen';
      case 'Rejected': return 'Odbijen';
      default: return status;
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Ugovori" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Ugovori" />

      <div className="data-table">
        <div className="table-header">
          <h2>Lista ugovora sa agencijama</h2>
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
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={20} style={{ marginRight: '8px' }} />
              Novi ugovor
            </button>
          </div>
        </div>

        {filteredContracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema ugovora. Kliknite "Novi ugovor" da kreirate novi.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pokrivenost (%)</th>
                <th>Početak</th>
                <th>Kraj</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id}>
                  <td>{contract.coveragePercent}%</td>
                  <td>{new Date(contract.startsOn).toLocaleDateString('sr-RS')}</td>
                  <td>{new Date(contract.endsOn).toLocaleDateString('sr-RS')}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: getStatusColor(contract.status) + '20',
                      color: getStatusColor(contract.status),
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {getStatusText(contract.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(contract)}
                        title="Izmeni"
                      >
                        <Edit size={16} />
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
        <ContractForm
          contract={editingContract}
          onClose={() => {
            setShowModal(false);
            setEditingContract(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingContract(null);
            loadContracts();
          }}
        />
      )}
    </div>
  );
};

export default ContractList;