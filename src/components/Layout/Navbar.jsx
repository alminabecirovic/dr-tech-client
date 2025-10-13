import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="navbar">
      <h1>{title}</h1>
      <div className="navbar-actions">
        <span style={{ color: '#718096' }}>
          {user?.email || 'User'}
        </span>
      </div>
    </div>
  );
};

export default Navbar;