import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Hospital } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('InsuredUser');
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
  try {
    const response = await fetch('https://localhost:7220/api/Auth/roles', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Roles loaded:', data);
    
    setRoles(data);
    
    // Set default role
    const defaultRole = data.find(r => r.defaultRole);
    if (defaultRole) {
      setRole(defaultRole.value);
    }
  } catch (error) {
    console.error('Failed to load roles:', error);
    // Set fallback roles if fetch fails
    const fallbackRoles = [
      { value: "InsuredUser", label: "Insured User", description: "Regular patient/user", defaultRole: true },
      { value: "Doctor", label: "Doctor", description: "Medical professional", defaultRole: false },
      { value: "HospitalAdmin", label: "Hospital Administrator", description: "Hospital management", defaultRole: false },
      { value: "InsuranceAgency", label: "Insurance Agency", description: "Insurance company representative", defaultRole: false }
    ];
    setRoles(fallbackRoles);
    setRole("InsuredUser");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju');
      return;
    }

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (!fullName.trim()) {
      setError('Ime i prezime je obavezno');
      return;
    }

    try {
      await register(email, password, role, fullName);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Registracija neuspešna. Email možda već postoji.');
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Hospital size={48} color="#667eea" style={{ margin: '0 auto' }} />
            <h1>Uspešno!</h1>
            <p>Vaš nalog je kreiran. Preusmeravamo vas na login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Hospital size={48} color="#667eea" style={{ margin: '0 auto' }} />
          <h1>DrTech Registracija</h1>
          <p>Kreirajte novi nalog</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ime i prezime *</label>
            <input
              type="text"
              placeholder="Npr. Marko Marković"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="vas.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Uloga *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} - {r.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lozinka *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Potvrdi lozinku *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Učitavanje...' : 'Registruj se'}
          </button>
        </form>

        <div className="auth-footer">
          Već imate nalog?
          <a href="/login">Ulogujte se</a>
        </div>
      </div>
    </div>
  );
};

export default Register;