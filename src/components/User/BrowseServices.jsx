import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from './../Layout/Navbar';
import { Search, Hospital, Stethoscope, Activity, MapPin, DollarSign, Calendar, Filter, X } from 'lucide-react';

const BrowseServices = () => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('hospitals');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    departmentId: '',
    serviceType: '',
    hospitalId: '',
    minPrice: '',
    maxPrice: '',
    specialist: '',
    date: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'services') {
      loadServicesWithFilters();
    }
  }, [filters, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hospitalsData, doctorsData, departmentsData] = await Promise.all([
        api.get('/Hospitals', token),
        api.get('/Doctors', token),
        api.get('/Departments', token)
      ]);

      setHospitals(hospitalsData || []);
      setDoctors(doctorsData || []);
      setDepartments(departmentsData || []);
      
      // Load services with filters
      await loadServicesWithFilters();
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadServicesWithFilters = async () => {
    try {
      // Build query params for User/services endpoint
      const params = new URLSearchParams();
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (filters.hospitalId) params.append('hospitalId', filters.hospitalId);
      if (filters.city) params.append('city', filters.city);
      if (filters.specialist) params.append('specialist', filters.specialist);
      if (filters.date) params.append('date', filters.date);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const queryString = params.toString();
      const endpoint = queryString ? `/User/services?${queryString}` : '/User/services';
      
      const servicesData = await api.get(endpoint, token);
      setServices(servicesData || []);
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      departmentId: '',
      serviceType: '',
      hospitalId: '',
      minPrice: '',
      maxPrice: '',
      specialist: '',
      date: ''
    });
  };

  // Filter hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filters.city || hospital.city?.toLowerCase().includes(filters.city.toLowerCase());
    return matchesSearch && matchesCity;
  });

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filters.departmentId || doctor.departmentId === filters.departmentId;
    return matchesSearch && matchesDepartment;
  });

  // Filter services (client-side additional filtering based on search)
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div>
        <Navbar title="Pretraživanje" />
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Pretraživanje" />
      
      <div className="dashboard-container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#262626', margin: 0 }}>
            Pretražite zdravstvene usluge
          </h1>
          <p style={{ color: '#8c8c8c', margin: '0.5rem 0 0 0' }}>
            Pronađite bolnice, doktore i medicinske usluge
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            background: '#fff2f0',
            color: '#cf1322',
            border: '1px solid #ffccc7'
          }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <button
            onClick={() => setActiveTab('hospitals')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'hospitals' ? '#1890ff' : 'transparent',
              color: activeTab === 'hospitals' ? 'white' : '#595959',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Hospital size={20} />
            <span>Bolnice ({filteredHospitals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'doctors' ? '#1890ff' : 'transparent',
              color: activeTab === 'doctors' ? 'white' : '#595959',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Stethoscope size={20} />
            <span>Doktori ({filteredDoctors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'services' ? '#1890ff' : 'transparent',
              color: activeTab === 'services' ? 'white' : '#595959',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Activity size={20} />
            <span>Usluge ({filteredServices.length})</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8c8c8c'
            }} />
            <input
              type="text"
              placeholder={
                activeTab === 'hospitals' ? 'Pretraži bolnice...' :
                activeTab === 'doctors' ? 'Pretraži doktore...' :
                'Pretraži usluge...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: showFilters ? '#1890ff' : 'white',
              color: showFilters ? 'white' : '#595959',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Filter size={20} />
            <span>Filteri</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{
            background: '#fafafa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#262626' }}>Filteri</h3>
              <button
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'white',
                  color: '#595959',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
                <span>Resetuj</span>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {activeTab === 'hospitals' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                    Grad
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    placeholder="Unesite grad"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}
              {activeTab === 'doctors' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                    Odeljenje
                  </label>
                  <select
                    value={filters.departmentId}
                    onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Sva odeljenja</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 'services' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Tip usluge
                    </label>
                    <select
                      value={filters.serviceType}
                      onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Sve usluge</option>
                      <option value="exam">Pregled</option>
                      <option value="surgery">Operacija</option>
                      <option value="lab">Laboratorija</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Bolnica
                    </label>
                    <select
                      value={filters.hospitalId}
                      onChange={(e) => setFilters({ ...filters, hospitalId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Sve bolnice</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Grad
                    </label>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      placeholder="Unesite grad"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Specijalista
                    </label>
                    <input
                      type="text"
                      value={filters.specialist}
                      onChange={(e) => setFilters({ ...filters, specialist: e.target.value })}
                      placeholder="Unesite specijalnost"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Min. cena ($)
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Max. cena ($)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="10000"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#595959' }}>
                      Datum
                    </label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'hospitals' && (
          <div>
            {filteredHospitals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
                <Hospital size={64} color="#d9d9d9" />
                <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema bolnica</h3>
                <p style={{ color: '#8c8c8c' }}>Pokušajte sa drugačijim filterima</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredHospitals.map((hospital) => (
                  <div key={hospital.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #1890ff15, #1890ff25)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <Hospital size={32} color="#1890ff" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#262626', margin: '0 0 1rem 0' }}>
                      {hospital.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <MapPin size={16} color="#8c8c8c" />
                      <span>{hospital.address}, {hospital.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959', fontSize: '0.875rem' }}>
                      <Activity size={16} color="#8c8c8c" />
                      <span>{hospital.type || 'Opšta bolnica'}</span>
                    </div>
                    <button style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}>
                      Pogledaj detalje
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div>
            {filteredDoctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
                <Stethoscope size={64} color="#d9d9d9" />
                <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema doktora</h3>
                <p style={{ color: '#8c8c8c' }}>Pokušajte sa drugačijim filterima</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredDoctors.map((doctor) => {
                  const department = departments.find(d => d.id === doctor.departmentId);
                  return (
                    <div key={doctor.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #52c41a15, #52c41a25)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}>
                        <Stethoscope size={32} color="#52c41a" />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#262626', margin: '0 0 0.5rem 0' }}>
                        Dr. {doctor.fullName}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: '#f0f5ff',
                        color: '#1890ff',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        marginBottom: '1rem'
                      }}>
                        {doctor.specialization || 'Opšta medicina'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#595959', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <Activity size={16} color="#8c8c8c" />
                        <span>{department?.name || 'N/A'}</span>
                      </div>
                      <button style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#52c41a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                        Zakaži termin
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            {filteredServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
                <Activity size={64} color="#d9d9d9" />
                <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#595959' }}>Nema usluga</h3>
                <p style={{ color: '#8c8c8c' }}>Pokušajte sa drugačijim filterima</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        Usluga
                      </th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        Šifra
                      </th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        Tip
                      </th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        Cene
                      </th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        Akcija
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => {
                      const typeLabels = { exam: 'Pregled', surgery: 'Operacija', lab: 'Laboratorija' };
                      const typeColors = { exam: '#1890ff', surgery: '#cf1322', lab: '#52c41a' };
                      
                      return (
                        <tr key={service.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, #722ed115, #722ed125)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Activity size={20} color="#722ed1" />
                              </div>
                              <span style={{ fontWeight: 500, color: '#262626' }}>{service.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#8c8c8c' }}>
                            {service.code}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              background: `${typeColors[service.type]}15`,
                              color: typeColors[service.type],
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}>
                              {typeLabels[service.type] || service.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            {service.prices && service.prices.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {service.prices.map((price, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <DollarSign size={14} color="#8c8c8c" />
                                    <span style={{ fontWeight: 600, color: '#262626' }}>
                                      ${price.price.toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                                      ({hospitals.find(h => h.id === price.hospitalId)?.name || 'N/A'})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#8c8c8c', fontSize: '0.875rem' }}>N/A</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <button style={{
                              padding: '0.5rem 1rem',
                              background: '#1890ff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <Calendar size={16} />
                              <span>Rezerviši</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseServices;