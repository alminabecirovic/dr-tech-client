import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Layout/Dashboard';
import Hospitals from './components/Agencies/Hospitals';
import Departments from './components/HospitalAdmin/Departments';
import Equipment from './components/HospitalAdmin/Equipment';
import Appointments from './components/HospitalAdmin/Appointments';
import Doctor from './components/Doctor';
import Patients from './components/HospitalAdmin/Patients';
import MyAppointments from './components/Doctor/MyAppointments';
import Services from './components/HospitalAdmin/Services';
import PriceList from './components/HospitalAdmin/PriceList';
import BrowseServices from './components/User/BrowseServices';  
import MyReservations from './components/User/MyReservations';
import InsuranceContracts from './components/Agencies/InsuranceContracts';
import InsuranceDiscounts from './components/Agencies/InsuranceDiscounts';
import InsurancePayments from './components/Agencies/InsurancePayments';
import HospitalContracts from './components/HospitalAdmin/HospitalContracts';
import PaymentUpload from './components/User/PaymentUpload';
import RequestService from './components/User/RequestService';
import AgencyPatients from './components/Agencies/AgencyPatients';
import InsuranceAgencies from './components/User/InsuranceAgencies';
import DiscountRequestsAgency from './components/Agencies/DiscountRequestsAgency';
import DiscountRequestsHospital from './components/HospitalAdmin/DiscountRequestsHospital';
import MyDiscounts from './components/User/MyDiscounts';

import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { token, user } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Layout with Sidebar
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
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
        element={token ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={token ? <Navigate to="/dashboard" replace /> : <Register />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/discounts/my"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <MyDiscounts />
            </Layout>
          </ProtectedRoute>
        }
      />
         <Route
        path="/discounts/hospital"
        element={
          <ProtectedRoute roles={['HospitalAdmin']}>
            <Layout>
              <DiscountRequestsHospital />
            </Layout>
          </ProtectedRoute>
        }
      />
        <Route
        path="/discounts/agency"
        element={
          <ProtectedRoute roles={['InsuranceAgency']}>
            <Layout>
              <DiscountRequestsAgency />
            </Layout>
          </ProtectedRoute>
        }
      />
        <Route
        path="my-discounts"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <MyDiscounts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute roles={['HospitalAdmin']}>
            <Layout>
              <Departments />
            </Layout>
          </ProtectedRoute>
        }
      />
        <Route
        path="/hcontracts"
        element={
          <ProtectedRoute roles={['HospitalAdmin']}>
            <Layout>
              <HospitalContracts />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* HospitalAdmin & Doctor Routes */}
      <Route
        path="/doctors"
        element={
          <ProtectedRoute roles={['HospitalAdmin', 'Doctor']}>
            <Layout>
              <Doctor />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute roles={['HospitalAdmin', 'Doctor', 'InsuranceAgency']}>
            <Layout>
              <Patients />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency-patients"
        element={
          <ProtectedRoute roles={[ 'InsuranceAgency']}>
            <Layout>
              <AgencyPatients />
            </Layout>
          </ProtectedRoute>
        }
      />
        

      <Route
        path="/equipment"
        element={
          <ProtectedRoute roles={['HospitalAdmin', 'Doctor']}>
            <Layout>
              <Equipment />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute roles={['HospitalAdmin', 'Doctor', 'InsuredUser']}>
            <Layout>
              <Appointments />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* HospitalAdmin - Additional Routes */}
      <Route
        path="/services"
        element={
          <ProtectedRoute roles={['HospitalAdmin']}>
            <Layout>
              <Services />
            </Layout>
          </ProtectedRoute>
        }
      />

     
      <Route
        path="/pricelist"
        element={
          <ProtectedRoute roles={['HospitalAdmin']}>
            <Layout>
              <PriceList />
            </Layout>
          </ProtectedRoute>
        }
      />

        {/* HospitalAdmin Routes */}
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute roles={['InsuranceAgency']}>
            <Layout>
              <Hospitals />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Only Route */}
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute roles={['Doctor']}>
            <Layout>
              <MyAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />
   <Route
        path="/browse-hospitals"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <BrowseServices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reservations"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <MyReservations />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/agencies"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <InsuranceAgencies />
            </Layout>
          </ProtectedRoute>
        }
      />
        <Route
        path="/payment-upload"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <PaymentUpload />
            </Layout>
          </ProtectedRoute>
        }
      />
        <Route
        path="/request-service"
        element={
          <ProtectedRoute roles={['InsuredUser']}>
            <Layout>
              <RequestService />
            </Layout>
          </ProtectedRoute>
        }
      />
       <Route
        path="/contracts"
        element={
          <ProtectedRoute roles={['InsuranceAgency']}>
            <Layout>
              < InsuranceContracts/>
            </Layout>
          </ProtectedRoute>
        }
      />
         <Route
        path="/discounts"
        element={
          <ProtectedRoute roles={['InsuranceAgency']}>
            <Layout>
              < InsuranceDiscounts/>
            </Layout>
          </ProtectedRoute>
        }
      />
       <Route
        path="/payments"
        element={
          <ProtectedRoute roles={['InsuranceAgency']}>
            <Layout>
              < InsurancePayments/>
            </Layout>
          </ProtectedRoute>
        }
      />
      
    
      {/* Default Routes */}
     <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;