import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Plus, Wrench, AlertCircle, CheckCircle, XCircle, Clock, History, Calendar } from 'lucide-react';

const Equipment = () => {
  const { token, hasRole } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    serialNumber: '',
    type: '',
    departmentId: ''
  });
  
  const [statusData, setStatusData] = useState({
    status: 'Ispravno',
    note: ''
  });
  
  const [serviceData, setServiceData] = useState({
    type: 'Service',
    scheduledAtUtc: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equipmentData, deptData] = await Promise.all([
        api.getEquipment(token),
        api.getDepartments(token)
      ]);
      setEquipment(equipmentData || []);
      setDepartments(deptData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.createEquipment(formData, token);
      setSuccess('Oprema uspešno dodata!');
      setFormData({ serialNumber: '', type: '', departmentId: '' });
      setShowCreateModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri dodavanju opreme');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.updateEquipmentStatus(selectedEquipment.id, statusData, token);
      setSuccess('Status opreme uspešno ažuriran!');
      setShowStatusModal(false);
      setSelectedEquipment(null);
      setStatusData({ status: 'Ispravno', note: '' });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri ažuriranju statusa');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formattedServiceData = {
  ...serviceData,
  scheduledAtUtc: new Date(serviceData.scheduledAtUtc).toISOString()
};

await api.scheduleEquipmentService(selectedEquipment.id, formattedServiceData, token);
      setSuccess('Servis uspešno zakazan!');
      setShowServiceModal(false);
      setSelectedEquipment(null);
      setServiceData({ type: 'Service', scheduledAtUtc: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Greška pri zakazivanju servisa');
    }
  };

  const openStatusModal = (item) => {
    setSelectedEquipment(item);
    setStatusData({ status: item.status, note: '' });
    setShowStatusModal(true);
  };

  const openServiceModal = (item) => {
    setSelectedEquipment(item);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setServiceData({ 
      type: 'Service', 
      scheduledAtUtc: tomorrow.toISOString().slice(0, 16) 
    });
    setShowServiceModal(true);
  };

  const openHistoryModal = async (item) => {
    setSelectedEquipment(item);
    setShowHistoryModal(true);
    
    try {
      const [history, orders] = await Promise.all([
        api.getEquipmentStatusHistory(item.id, token),
        api.getEquipmentServiceOrders(item.id, token)
      ]);
      setStatusHistory(history || []);
      setServiceOrders(orders || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Ispravno': return <CheckCircle size={20} color="#48bb78" />;
      case 'Neispravno': return <AlertCircle size={20} color="#f56565" />;
      default: return <Wrench size={20} color="#718096" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Ispravno': { bg: '#c6f6d5', color: '#22543d' },
      'Neispravno': { bg: '#fed7d7', color: '#742a2a' },
    };
    const style = colors[status] || colors['Ispravno'];
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        background: style.bg,
        color: style.color
      }}>
        {status}
      </span>
    );
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Nepoznato';
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Oprema" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Oprema" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div className="page-header">
          {hasRole('HospitalAdmin') && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              Dodaj Opremu
            </button>
          )}
        </div>

        {equipment.length === 0 ? (
          <div className="empty-state">
            <Wrench size={64} color="#cbd5e0" />
            <h3>Nema opreme</h3>
            <p>Kliknite na "Dodaj Opremu" da dodate prvu opremu</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Serijski Broj</th>
                  <th>Tip</th>
                  <th>Odeljenje</th>
                  <th>Status</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusIcon(item.status)}
                        <strong>{item.serialNumber}</strong>
                      </div>
                    </td>
                    <td>{item.type}</td>
                    <td>{getDepartmentName(item.departmentId)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => openStatusModal(item)}
                          title="Promeni status"
                        >
                          <AlertCircle size={16} />
                        </button>
                        {hasRole('HospitalAdmin') && (
                          <button 
                            className="btn-icon" 
                            onClick={() => openServiceModal(item)}
                            title="Zakaži servis"
                          >
                            <Calendar size={16} />
                          </button>
                        )}
                        <button 
                          className="btn-icon" 
                          onClick={() => openHistoryModal(item)}
                          title="Pregled istorije"
                        >
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Equipment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj Novu Opremu</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Serijski Broj *</label>
                <input
                  type="text"
                  placeholder="Npr. EQ-2024-001"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tip Opreme *</label>
                <input
                  type="text"
                  placeholder="Npr. Ultrazvuk, Rentgen, EKG..."
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Odeljenje *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  required
                >
                  <option value="">Izaberite odeljenje</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Dodaj Opremu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Promeni Status Opreme</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>×</button>
            </div>

            <div style={{ padding: '16px 24px', background: '#f7fafc', marginBottom: '16px' }}>
              <strong>{selectedEquipment?.serialNumber}</strong> - {selectedEquipment?.type}
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({...statusData, status: e.target.value})}
                  required
                >
                  <option value="Ispravno">Ispravno</option>
                  <option value="Neispravno">Neispravno</option>
                </select>
              </div>

              <div className="form-group">
                <label>Napomena</label>
                <textarea
                  placeholder="Dodatne informacije o promeni statusa..."
                  value={statusData.note}
                  onChange={(e) => setStatusData({...statusData, note: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Ažuriraj Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Zakaži Servis</h2>
              <button className="modal-close" onClick={() => setShowServiceModal(false)}>×</button>
            </div>

            <div style={{ padding: '16px 24px', background: '#f7fafc', marginBottom: '16px' }}>
              <strong>{selectedEquipment?.serialNumber}</strong> - {selectedEquipment?.type}
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleServiceSubmit}>
              <div className="form-group">
                <label>Tip Servisa *</label>
                <select
                  value={serviceData.type}
                  onChange={(e) => setServiceData({...serviceData, type: e.target.value})}
                  required
                >
                  <option value="Service">Redovni servis</option>
                  <option value="Repair">Popravka</option>
                  <option value="Replacement">Zamena</option>
                  <option value="Maintenance">Održavanje</option>
                </select>
              </div>

              <div className="form-group">
                <label>Datum i Vreme *</label>
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  value={serviceData.scheduledAtUtc}
                  onChange={(e) => setServiceData({...serviceData, scheduledAtUtc: e.target.value})}
                  required
                />

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>
                  Otkaži
                </button>
                <button type="submit" className="btn btn-primary">Zakaži Servis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Istorija Opreme</h2>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>

            <div style={{ padding: '16px 24px', background: '#f7fafc', marginBottom: '16px' }}>
              <strong>{selectedEquipment?.serialNumber}</strong> - {selectedEquipment?.type}
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>
                <History size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Istorija Statusa
              </h3>
              
              {statusHistory.length === 0 ? (
                <p style={{ color: '#718096', padding: '16px', background: '#f7fafc', borderRadius: '8px' }}>
                  Nema zabeležene istorije statusa
                </p>
              ) : (
                <div className="history-timeline">
                  {statusHistory.map((log) => (
                    <div key={log.id} className="history-item">
                      <div className="history-icon">{getStatusIcon(log.status)}</div>
                      <div className="history-content">
                        <div className="history-status">{log.status}</div>
                        <div className="history-note">{log.note || 'Bez napomene'}</div>
                        <div className="history-time">
                          {new Date(log.loggedAtUtc).toLocaleString('sr-RS')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '16px' }}>
                <Calendar size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Servisi i Nalozi
              </h3>
              
              {serviceOrders.length === 0 ? (
                <p style={{ color: '#718096', padding: '16px', background: '#f7fafc', borderRadius: '8px' }}>
                  Nema zakazanih servisa
                </p>
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tip</th>
                        <th>Zakazano Za</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.type}</td>
                          <td>{new Date(order.scheduledAtUtc).toLocaleString('sr-RS')}</td>
                          <td>{getStatusBadge(order.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-icon {
          padding: 6px;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .modal-large {
          max-width: 800px;
        }

        .history-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }

        .history-icon {
          flex-shrink: 0;
        }

        .history-content {
          flex: 1;
        }

        .history-status {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .history-note {
          color: #4a5568;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .history-time {
          color: #718096;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default Equipment;