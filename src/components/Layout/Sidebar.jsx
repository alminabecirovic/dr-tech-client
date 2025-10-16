import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Hospital, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  CreditCard, 
  Building2,
  ClipboardList,
  LogOut,
  Wrench,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, hasRole } = useAuth();

  // Menu items based on roles
  const getMenuItems = () => {
    const items = [
      { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['HospitalAdmin', 'Doctor', 'InsuranceAgency', 'InsuredUser'] }
    ];

    // HospitalAdmin menu
    if (hasRole('HospitalAdmin')) {
      items.push(
        
        { path: '/departments', icon: Building2, label: 'Odeljenja', roles: ['HospitalAdmin'] },
        { path: '/doctors', icon: Stethoscope, label: 'Doktori', roles: ['HospitalAdmin'] },
        { path: '/patients', icon: Users, label: 'Pacijenti', roles: ['HospitalAdmin'] },
        { path: '/equipment', icon: Wrench, label: 'Oprema', roles: ['HospitalAdmin'] },
        { path: '/appointments', icon: Calendar, label: 'Termini', roles: ['HospitalAdmin'] },
        { path: '/services', icon: ClipboardList, label: 'Usluge', roles: ['HospitalAdmin'] },
        { path: '/pricelist', icon: FileText, label: 'Cenovnik', roles: ['HospitalAdmin'] },
      );
    }

    // Doctor menu
    if (hasRole('Doctor')) {
      items.push(
        { path: '/my-appointments', icon: Calendar, label: 'Moji Termini', roles: ['Doctor'] },
        { path: '/patients', icon: Users, label: 'Pacijenti', roles: ['Doctor'] },
        { path: '/equipment', icon: Wrench, label: 'Oprema', roles: ['Doctor'] }
      );
    }

    // InsuranceAgency menu
    if (hasRole('InsuranceAgency')) {
      items.push(
        { path: '/hospitals', icon: Hospital, label: 'Bolnice', roles: ['InsuranceAgency'] },
        { path: '/agencies', icon: Building2, label: 'Agencije', roles: ['InsuranceAgency'] },
        { path: '/contracts', icon: FileText, label: 'Ugovori', roles: ['InsuranceAgency'] },
        { path: '/patients', icon: Users, label: 'Osiguranici', roles: ['InsuranceAgency'] },
        { path: '/payments', icon: CreditCard, label: 'Plaćanja', roles: ['InsuranceAgency'] },
        { path: '/audit', icon: Shield, label: 'Audit Logovi', roles: ['InsuranceAgency'] },
        { path: '/discounts', icon: Shield, label: 'Popusti', roles: ['InsuranceAgency'] }
      );
    }

    // InsuredUser menu
    if (hasRole('InsuredUser')) {
      items.push(
        { path: '/browse-hospitals', icon: Hospital, label: 'Bolnice', roles: ['InsuredUser'] },
        { path: '/my-reservations', icon: Calendar, label: 'Moje Rezervacije', roles: ['InsuredUser'] },
        { path: '/my-payments', icon: CreditCard, label: 'Moja Plaćanja', roles: ['InsuredUser'] }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          <Hospital size={28} />
          DrTech
        </h2>
        {user && (
          <div style={{ fontSize: '12px', color: '#cbd5e0', marginTop: '8px' }}>
            {user.fullName || user.email}
            <br />
            <span style={{ fontSize: '10px', color: '#718096' }}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        )}
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </li>
        ))}

        <li className="sidebar-item" onClick={handleLogout} style={{ marginTop: '32px', borderTop: '1px solid #2d3748', paddingTop: '16px' }}>
          <LogOut size={20} />
          <span>Odjavi se</span>
        </li>
      </ul>
    </div>
  );
};

const getRoleLabel = (role) => {
  switch(role) {
    case 'HospitalAdmin': return 'Administrator Bolnice';
    case 'Doctor': return 'Doktor';
    case 'InsuranceAgency': return 'Osiguravajuća Agencija';
    case 'InsuredUser': return 'Osiguranik';
    default: return role;
  }
};

export default Sidebar;