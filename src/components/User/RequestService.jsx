import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const RequestService = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [requestDiscount, setRequestDiscount] = useState(false);
  const [discountReason, setDiscountReason] = useState('');
  const [discountExplanation, setDiscountExplanation] = useState('');
  const [requestedDiscountPercent, setRequestedDiscountPercent] = useState('10');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      // Load hospitals, services, and price list from separate endpoints
      const [hospitalsRes, servicesRes, priceListRes] = await Promise.all([
        api.getHospitals(token),
        api.getServices(token),
        api.getPricelist(token)
      ]);

      setHospitals(hospitalsRes || []);
      setAllServices(servicesRes || []);
      setPriceList(priceListRes || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Get services available for selected hospital
  const getHospitalServices = () => {
    if (!selectedHospital) return [];
    
    // Get price list items for this hospital
    const hospitalPrices = priceList.filter(p => p.hospitalId === selectedHospital);
    
    // Map to services with prices
    return hospitalPrices.map(price => {
      const service = allServices.find(s => s.id === price.medicalServiceId);
      return {
        id: price.medicalServiceId,
        name: service?.name || 'Unknown Service',
        price: price.price,
        priceListItemId: price.id
      };
    });
  };

  const filteredServices = getHospitalServices();

  const totalPrice = selectedServices.reduce((sum, serviceId) => {
    const service = filteredServices.find(s => s.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);

  const handleSubmit = async () => {
    console.log('=== SUBMIT STARTED ===');
    console.log('Current user:', user);
    console.log('Selected hospital:', selectedHospital);
    console.log('Request discount:', requestDiscount);
    
    if (!selectedHospital || selectedServices.length === 0) {
      setError('Morate izabrati ustanovu i najmanje jednu uslugu');
      return;
    }

    if (requestDiscount && (!discountReason || !discountExplanation || !requestedDiscountPercent)) {
      setError('Molimo popunite razlog, obrazloženje i traženi procenat popusta');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      // Since there's no PreContract endpoint, we'll only create discount request if needed
      if (requestDiscount) {
        try {
          // Get first available agency as default if user doesn't have one
          let agencyId = user.insuranceAgencyId || user.agencyId;
          
          // If user doesn't have an agency, try to get first available agency
          if (!agencyId || agencyId === '00000000-0000-0000-0000-000000000000') {
            try {
              const agencies = await api.getAgencies(token);
              if (agencies && agencies.length > 0) {
                agencyId = agencies[0].id;
                console.log('Using first available agency:', agencyId);
              }
            } catch (err) {
              console.warn('Could not fetch agencies:', err);
            }
          }
          
          const requestData = {
            insuranceAgencyId: agencyId || '00000000-0000-0000-0000-000000000000',
            hospitalId: selectedHospital,
            patientId: user.id || user.userId,
            requestedDiscountPercent: parseFloat(requestedDiscountPercent),
            reason: discountReason,
            explanation: discountExplanation
          };

          console.log('Sending discount request with data:', JSON.stringify(requestData, null, 2));

          await api.createDiscountRequest(requestData, token);

          setSuccess('Zahtev za dodatni popust je uspešno poslat! Čeka se odobrenje.');
        } catch (err) {
          console.error('Discount request error:', err);
          console.error('Error message:', err.message);
          console.error('Error details:', JSON.stringify(err, null, 2));
          
          // If 403, user doesn't have permission - inform them
          if (err.message?.includes('403')) {
            setSuccess('Vaš zahtev za popust je zabeležen. Molimo kontaktirajte vašu agenciju da ga procesira.');
          } else if (err.message?.includes('400') || err.message?.includes('Validation')) {
            setError('Greška u podacima. Molimo proverite da li imate aktivnu agenciju u profilu.');
          } else {
            throw err; // Re-throw other errors
          }
        }
      } else {
        // Just show success message - in real app you'd create PreContract here
        setSuccess('Zahtev je zabeležen. Kontaktirajte agenciju za dalji proces.');
      }
      
      // Reset form
      setSelectedHospital('');
      setSelectedServices([]);
      setRequestDiscount(false);
      setDiscountReason('');
      setDiscountExplanation('');
      setRequestedDiscountPercent('10');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Greška pri slanju zahteva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#8c8c8c', marginTop: '1rem' }}>Učitavanje...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
          Zahtev za pregled/zahvat
        </h1>
        <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
          Izaberite ustanovu i usluge koje su vam potrebne
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

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {/* Select Hospital */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            fontWeight: 600,
            color: '#262626'
          }}>
            Izaberite ustanovu
          </label>
          <select
            value={selectedHospital}
            onChange={(e) => {
              setSelectedHospital(e.target.value);
              setSelectedServices([]);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Izaberite ustanovu --</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} {h.city ? `- ${h.city}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Services List */}
        {selectedHospital && filteredServices.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: 600,
              color: '#262626'
            }}>
              Izaberite usluge
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredServices.map(service => (
                <label
                  key={service.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: selectedServices.includes(service.id)
                      ? '2px solid #1890ff'
                      : '1px solid #d9d9d9',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedServices.includes(service.id)
                      ? '#f0f5ff'
                      : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#262626' }}>
                        {service.name}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 700,
                    color: '#1890ff',
                    fontSize: '1.125rem'
                  }}>
                    ${service.price.toFixed(2)}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {selectedHospital && filteredServices.length === 0 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#8c8c8c', margin: 0 }}>
              Ova ustanova trenutno nema dostupnih usluga u cenovniku.
            </p>
          </div>
        )}

        {/* Total */}
        {selectedServices.length > 0 && (
          <div style={{
            padding: '1.5rem',
            background: '#fafafa',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#595959' }}>
                Ukupno:
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1890ff' }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Request Discount Checkbox */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}>
              <input
                type="checkbox"
                checked={requestDiscount}
                onChange={(e) => setRequestDiscount(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500, color: '#262626' }}>
                Zahtevam dodatni popust preko agencije
              </span>
            </label>
          </div>
        )}

        {/* Discount Request Form */}
        {requestDiscount && (
          <div style={{
            padding: '1.5rem',
            background: '#fff7e6',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #ffd591'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#262626'
            }}>
              Zahtev za dodatni popust
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: '#595959'
              }}>
                Traženi procenat popusta (%)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={requestedDiscountPercent}
                onChange={(e) => setRequestedDiscountPercent(e.target.value)}
                placeholder="Npr. 10"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: '#595959'
              }}>
                Razlog
              </label>
              <select
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Izaberite razlog --</option>
                <option value="Children">Dete</option>
                <option value="Disabled">Osoba sa invaliditetom</option>
                <option value="Special">Posebni slučaj</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: '#595959'
              }}>
                Obrazloženje
              </label>
              <textarea
                value={discountExplanation}
                onChange={(e) => setDiscountExplanation(e.target.value)}
                placeholder="Detaljno obrazložite razlog za dodatni popust..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedHospital || selectedServices.length === 0 || submitting}
          style={{
            width: '100%',
            padding: '1rem',
            background: (!selectedHospital || selectedServices.length === 0 || submitting)
              ? '#d9d9d9'
              : '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: 600,
            cursor: (!selectedHospital || selectedServices.length === 0 || submitting)
              ? 'not-allowed'
              : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
        >
          {submitting ? (
            <>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Šaljem...</span>
            </>
          ) : (
            <span>Pošalji zahtev</span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RequestService;