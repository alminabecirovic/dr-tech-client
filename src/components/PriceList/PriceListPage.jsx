import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../Layout/Navbar';
import PriceListForm from './PriceListForm';
import { Plus, Edit, Search } from 'lucide-react';

const PriceListPage = () => {
  const { token } = useAuth();
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPriceList();
  }, []);

  const loadPriceList = async () => {
    try {
      const data = await api.get('/PriceList', token);
      setPriceList(data);
    } catch (error) {
      console.error('Failed to load price list', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const filteredPriceList = priceList.filter(item =>
    searchTerm === '' || item.isActive.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div>
        <Navbar title="Cenovnik" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Cenovnik" />

      <div className="data-table">
        <div className="table-header">
          <h2>Cenovnik medicinskih usluga</h2>
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
              Dodaj stavku
            </button>
          </div>
        </div>

        {filteredPriceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Nema stavki u cenovniku. Kliknite "Dodaj stavku" da kreirate novu.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cena (RSD)</th>
                <th>Važi od</th>
                <th>Važi do</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredPriceList.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600', color: '#2d3748' }}>
                    {item.price.toLocaleString('sr-RS')} RSD
                  </td>
                  <td>{new Date(item.validFrom).toLocaleDateString('sr-RS')}</td>
                  <td>{new Date(item.validUntil).toLocaleDateString('sr-RS')}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: item.isActive ? '#52c41a20' : '#f5222d20',
                      color: item.isActive ? '#52c41a' : '#f5222d',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {item.isActive ? 'Aktivna' : 'Neaktivna'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(item)}
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
        <PriceListForm
          item={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingItem(null);
            loadPriceList();
          }}
        />
      )}
    </div>
  );
};

export default PriceListPage;