import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import HospitalList from './components/Hospitals/HospitalList';
import DoctorList from './components/Doctors/DoctorList';
import PatientList from './components/Patients/PatientList';
import DepartmentList from './components/Departments/DepartmentList';
import ServiceList from './components/Services/ServiceList';
import ReservationList from './components/Reservations/ReservationList';
import AgencyList from './components/Agencies/AgencyList';
import ContractList from './components/Contracts/ContractList';
import PriceListPage from './components/PriceList/PriceListPage';
import PaymentList from './components/Payments/PaymentList';
import Sidebar from './components/Layout/Sidebar';
import './App.css';

// Protected Route Component (ostavljen, ali se više ne koristi)
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout with Sidebar
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={token ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={token ? <Navigate to="/dashboard" /> : <Register />} 
      />

      {/* Sve rute su sada javne (bez ProtectedRoute) */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/hospitals"
        element={
          <Layout>
            <HospitalList />
          </Layout>
        }
      />
      <Route
        path="/departments"
        element={
          <Layout>
            <DepartmentList />
          </Layout>
        }
      />
      <Route
        path="/doctors"
        element={
          <Layout>
            <DoctorList />
          </Layout>
        }
      />
      <Route
        path="/patients"
        element={
          <Layout>
            <PatientList />
          </Layout>
        }
      />
      <Route
        path="/services"
        element={
          <Layout>
            <ServiceList />
          </Layout>
        }
      />
      <Route
        path="/reservations"
        element={
          <Layout>
            <ReservationList />
          </Layout>
        }
      />
      <Route
        path="/agencies"
        element={
          <Layout>
            <AgencyList />
          </Layout>
        }
      />
      <Route
        path="/contracts"
        element={
          <Layout>
            <ContractList />
          </Layout>
        }
      />
      <Route
        path="/pricelist"
        element={
          <Layout>
            <PriceListPage />
          </Layout>
        }
      />
      <Route
        path="/payments"
        element={
          <Layout>
            <PaymentList />
          </Layout>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
