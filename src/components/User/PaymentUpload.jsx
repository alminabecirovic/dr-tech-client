import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const PaymentUpload = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [agencies, setAgencies] = useState({});
  const [selectedContract, setSelectedContract] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, paymentsData, hospitalsData, agenciesData] = await Promise.all([
        api.getPreContracts(token),
        api.getPayments(token),
        api.getHospitals(token),
        api.getAgencies(token)
      ]);

      const hospitalMap = {};
      hospitalsData.forEach(h => {
        hospitalMap[h.id] = h.name;
      });

      const agencyMap = {};
      agenciesData.forEach(a => {
        agencyMap[a.id] = a.name;
      });

      setHospitals(hospitalMap);
      setAgencies(agencyMap);
      setPayments(paymentsData);

      const activeContracts = contractsData.filter(c => c.status === 'Active');
      setContracts(activeContracts);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setProofFile(file);
      setError('');
    } else {
      setError('Molimo uploadujte PDF ili sliku (JPG, PNG)');
      setProofFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedContract || !paymentAmount || !proofFile) {
      setError('Sva polja su obavezna');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('PreContractId', selectedContract);
      formData.append('Amount', paymentAmount);
      
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      formData.append('DueDateUtc', dueDate.toISOString());
      
      formData.append('Proof', proofFile);

      await api.createPayment(formData, token);
      
      setSuccess('Dokaz o uplati je uspešno poslat! Čeka se potvrda od ustanove.');
      setPaymentAmount('');
      setProofFile(null);
      setSelectedContract('');
      
      await loadData();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Greška pri slanju dokaza o uplati');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const getContractFinancials = (contract) => {
    const contractPayments = payments.filter(p => p.preContractId === contract.id);
    const paidAmount = contractPayments
      .filter(p => p.confirmed)
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = contractPayments
      .filter(p => !p.confirmed)
      .reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = contract.agreedPrice - paidAmount - pendingAmount;
    
    return {
      totalAmount: contract.agreedPrice,
      paidAmount,
      pendingAmount,
      remainingAmount: Math.max(0, remainingAmount)
    };
  };

  const selectedContractData = contracts.find(c => c.id === selectedContract);
  const selectedFinancials = selectedContractData ? getContractFinancials(selectedContractData) : null;

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

      {loading && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#8c8c8c' }}>Učitavanje...</p>
        </div>
      )}

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

      {!loading && (
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
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
              {contracts.map(c => {
                const financials = getContractFinancials(c);
                return (
                  <option key={c.id} value={c.id}>
                    {hospitals[c.hospitalId] || 'N/A'} - Preostalo: ${financials.remainingAmount.toFixed(2)}
                  </option>
                );
              })}
            </select>
            {contracts.length === 0 && !loading && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#fa8c16' }}>
                Nemate aktivnih ugovora
              </p>
            )}
          </div>

          {selectedFinancials && (
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
                    ${selectedFinancials.totalAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Potvrđeno uplaćeno</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#52c41a' }}>
                    ${selectedFinancials.paidAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>U obradi</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1890ff' }}>
                    ${selectedFinancials.pendingAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#8c8c8c', marginBottom: '0.25rem' }}>Preostalo za uplatu</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fa8c16' }}>
                    ${selectedFinancials.remainingAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#262626' }}>
              Iznos uplate ($)
            </label>
            <input
              type="number"
              min="1"
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

          <button
            type="submit"
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
              gap: '0.75rem'
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
        </form>
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