import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Shield, Filter, Download, Calendar, User, Activity, CheckCircle, XCircle } from 'lucide-react';

const AuditLogs = () => {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    actor: '',
    action: '',
    path: '',
    statusCode: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 50
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, summaryData] = await Promise.all([
        api.getAuditLogs(filters, token),
        api.getAuditSummary(filters.startDate, filters.endDate, token)
      ]);
      setAuditLogs(logsData || []);
      setSummary(summaryData || null);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setError('Greška pri učitavanju audit logova');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({
      actor: '',
      action: '',
      path: '',
      statusCode: '',
      startDate: '',
      endDate: '',
      page: 1,
      pageSize: 50
    });
    setTimeout(() => loadData(), 100);
  };

  const handleExport = async () => {
    try {
      setSuccess('Eksportovanje podataka...');
      await api.exportAuditLogs({
        startDate: filters.startDate,
        endDate: filters.endDate,
        actor: filters.actor
      }, token);
      setSuccess('Audit logovi uspešno eksportovani!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Greška pri eksportovanju');
    }
  };

  const getStatusBadge = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          background: '#c6f6d5',
          color: '#22543d',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <CheckCircle size={10} />
          {statusCode}
        </span>
      );
    } else if (statusCode >= 400) {
      return (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          background: '#fed7d7',
          color: '#742a2a',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <XCircle size={10} />
          {statusCode}
        </span>
      );
    }
    return <span>{statusCode}</span>;
  };

  const getActionColor = (action) => {
    const colors = {
      'Create': '#48bb78',
      'Update': '#ed8936',
      'Delete': '#f56565',
      'Read': '#4299e1'
    };
    return colors[action] || '#718096';
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Audit Logovi" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Audit Logovi" />

      <div className="page-content">
        {success && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="page-header">
          <div>
            <h2>Audit Logovi</h2>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Pregled svih akcija korisnika u sistemu
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filteri
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={20} />
              Eksportuj
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div className="stat-card">
              <div className="stat-value">{summary.totalActions}</div>
              <div className="stat-label">Ukupno Akcija</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#48bb78' }}>{summary.createActions}</div>
              <div className="stat-label">Create</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#ed8936' }}>{summary.updateActions}</div>
              <div className="stat-label">Update</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#f56565' }}>{summary.deleteActions}</div>
              <div className="stat-label">Delete</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#48bb78' }}>{summary.successfulActions}</div>
              <div className="stat-label">Uspešne</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#f56565' }}>{summary.failedActions}</div>
              <div className="stat-label">Neuspešne</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
              Filteri
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Korisnik</label>
                <input
                  type="text"
                  name="actor"
                  placeholder="Email korisnika"
                  value={filters.actor}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group">
                <label>Akcija</label>
                <select name="action" value={filters.action} onChange={handleFilterChange}>
                  <option value="">Sve</option>
                  <option value="Create">Create</option>
                  <option value="Update">Update</option>
                  <option value="Delete">Delete</option>
                  <option value="Read">Read</option>
                </select>
              </div>
              <div className="form-group">
                <label>Path</label>
                <input
                  type="text"
                  name="path"
                  placeholder="/api/..."
                  value={filters.path}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group">
                <label>Status Code</label>
                <input
                  type="number"
                  name="statusCode"
                  placeholder="200, 404, 500..."
                  value={filters.statusCode}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group">
                <label>Od Datuma</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group">
                <label>Do Datuma</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={handleApplyFilters}>
                Primeni Filtere
              </button>
              <button className="btn btn-secondary" onClick={handleClearFilters}>
                Obriši Filtere
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        {auditLogs.length === 0 ? (
          <div className="empty-state">
            <Shield size={64} color="#cbd5e0" />
            <h3>Nema audit logova</h3>
            <p>Logovi će se prikazati kada korisnici izvrše akcije</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Vreme</th>
                  <th>Korisnik</th>
                  <th>Akcija</th>
                  <th>Path</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Opis</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="#718096" />
                        <div style={{ fontSize: '12px' }}>
                          <div>{new Date(log.occurredAtUtc).toLocaleDateString('sr-RS')}</div>
                          <div style={{ color: '#a0aec0' }}>
                            {new Date(log.occurredAtUtc).toLocaleTimeString('sr-RS')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} color="#718096" />
                        <span style={{ fontSize: '13px' }}>{log.actor}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: getActionColor(log.action),
                        border: `1px solid ${getActionColor(log.action)}`,
                        background: `${getActionColor(log.action)}10`
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', fontFamily: 'monospace', color: '#4a5568' }}>
                      {log.path}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 6px',
                        background: '#edf2f7',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {log.method}
                      </span>
                    </td>
                    <td>{getStatusBadge(log.statusCode)}</td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#718096' }}>
                        {log.description ? (
                          log.description.substring(0, 40) + (log.description.length > 40 ? '...' : '')
                        ) : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Info */}
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          color: '#718096', 
          fontSize: '14px' 
        }}>
          Prikazano {auditLogs.length} logova (Stranica {filters.page})
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;