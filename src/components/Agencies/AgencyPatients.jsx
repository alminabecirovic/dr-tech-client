import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';

const PaymentUpload = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch active pre-contracts for the logged-in user
      const response = await api.get('/api/Contracts');
      
      console.log('Contracts response:', response.data);
      
      // Filter only active contracts
      const activeContracts = (response.data || []).filter(c => 
        c.status === 'Active' || c.status === 'Approved' || c.status === 'Pending'
      );
      
      setContracts(activeContracts);
    } catch (err) {
      console.error('Error loading contracts:', err);
      
      if (err.response?.status === 401) {
        setError('Niste autorizovani. Molimo prijavite se ponovo.');
      } else if (err.response?.status === 403) {
        setError('Nemate dozvolu za pristup ugovorima.');
      } else {
        setError('Greška pri učitavanju ugovora: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('Fajl je prevelik. Maksimalna veličina je 20MB.');
        setProofFile(null);
        return;
      }
      
      // Check file type
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setProofFile(file);
        setError('');
      } else {
        setError('Molimo uploadujte PDF ili sliku (JPG, PNG)');
        setProofFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedContract || !paymentAmount || !dueDate || !proofFile) {
      setError('Sva polja su obavezna');
      return;
    }

    // Validate amount
    if (parseFloat(paymentAmount) <= 0) {
      setError('Iznos mora biti veći od 0');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('PreContractId', selectedContract);
      formData.append('Amount', paymentAmount);
      formData.append('DueDateUtc', new Date(dueDate).toISOString());
      formData.append('Proof', proofFile);

      // Call API
      const response = await api.post('/api/Payments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Dokaz o uplati je uspešno poslat! Čeka se potvrda od agencije.');
      
      // Reset form
      setPaymentAmount('');
      setDueDate('');
      setProofFile(null);
      setSelectedContract('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
      // Reload contracts to update remaining amounts
      loadContracts();
    } catch (err) {
      console.error('Error uploading payment:', err);
      setError(err.response?.data?.message || 'Greška pri slanju dokaza o uplati');
    } finally {
      setUploading(false);
    }
  };

  const selectedContractData = contracts.find(c => c.id === selectedContract);

  // Calculate remaining amount based on payments
  const calculateRemainingAmount = (contract) => {
    if (!contract) return 0;
    const totalPaid = contract.payments?.reduce((sum, p) => sum + (p.confirmed ? p.amount : 0), 0) || 0;
    return contract.totalAmount - totalPaid;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f0f0f0',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '2rem auto'
        }} />
        <p style={{ color: '#8c8c8c' }}>Učitavanje...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
          Evidencija uplate
        </h1>
        <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
          Uploadujte dokaz o izvršenoj uplati
        </p>
      </div>

      {success && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: '#f6ffed',
          color: '#52c41a',
          border: '1px solid #b7eb8f',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: '#fff2f0',
          color: '#cf1322',
          border: '1px solid #ffccc7',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {contracts.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem 2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <FileText size={64} color="#d9d9d9" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#262626', marginBottom: '0.5rem' }}>Nema aktivnih ugovora</h3>
          <p style={{ color: '#8c8c8c' }}>
            Trenutno nemate aktivne ugovore za koje možete evidentirati uplatu.
          </p>
        </div>
      ) : (
        <div onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {/* Select Contract */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#262626' }}>
              Izaberite ugovor
            </label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Izaberite aktivni ugovor --</option>
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.hospitalName || `Ugovor ${c.id.substring(0, 8)}`} - Preostalo: ${calculateRemainingAmount(c).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Contract Details */}
          {selectedContractData && (
            <div style={{
              padding: '1.5rem',
              background: '#fafafa',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: '#262626' }}>
                Detalji ugovora
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Ukupan iznos</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#262626' }}>
                    ${selectedContractData.totalAmount?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Uplaćeno</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#52c41a' }}>
                    ${(selectedContractData.totalAmount - calculateRemainingAmount(selectedContractData)).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Preostalo</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fa8c16' }}>
                    ${calculateRemainingAmount(selectedContractData).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Status</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#262626' }}>
                    {selectedContractData.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#262626' }}>
              Iznos uplate ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Unesite iznos uplate"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#262626' }}>
              Datum dospeća
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#262626' }}>
              Dokaz o uplati (PDF ili slika)
            </label>
            <div style={{
              border: '2px dashed #d9d9d9',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              background: proofFile ? '#f6ffed' : '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="file"
                id="proof-upload"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                required
                style={{ display: 'none' }}
              />
              <label htmlFor="proof-upload" style={{ cursor: 'pointer', display: 'block' }}>
                {proofFile ? (
                  <div>
                    <CheckCircle size={48} color="#52c41a" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 600, color: '#262626', marginBottom: '0.5rem' }}>
                      {proofFile.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>
                      {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setProofFile(null);
                      }}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Ukloni fajl
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} color="#8c8c8c" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 600, color: '#262626', marginBottom: '0.5rem' }}>
                      Kliknite ili prevucite fajl ovde
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>
                      Podržani formati: JPG, PNG, PDF (max 20MB)
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '1rem',
              background: uploading ? '#d9d9d9' : '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'background 0.2s'
            }}
          >
            {uploading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Šaljem...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Pošalji dokaz o uplati</span>
              </>
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentUpload;