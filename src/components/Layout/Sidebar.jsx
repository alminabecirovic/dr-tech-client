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
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/hospitals', icon: Hospital, label: 'Bolnice' },
    { path: '/departments', icon: Building2, label: 'Odeljenja' },
    { path: '/doctors', icon: Stethoscope, label: 'Doktori' },
    { path: '/patients', icon: Users, label: 'Pacijenti' },
    { path: '/services', icon: ClipboardList, label: 'Usluge' },
    { path: '/reservations', icon: Calendar, label: 'Rezervacije' },
    { path: '/agencies', icon: Building2, label: 'Agencije' },
    { path: '/contracts', icon: FileText, label: 'Ugovori' },
    { path: '/pricelist', icon: FileText, label: 'Cenovnik' },
    { path: '/payments', icon: CreditCard, label: 'Plaćanja' },
  ];

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

        <li className="sidebar-item" onClick={handleLogout} style={{ marginTop: '32px' }}>
          <LogOut size={20} />
          <span>Odjavi se</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;