// services/api.js
const API_BASE_URL = 'https://localhost:7220/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Generic CRUD methods
  async get(endpoint, token) {
    return this.request(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post(endpoint, data, token) {
    return this.request(endpoint, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, token) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, token) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  // ===== HOSPITALS =====
  async getHospitals(token) {
    return this.get('/Hospitals', token);
  }

  async createHospital(data, token) {
    return this.post('/Hospitals', data, token);
  }

  // ===== DEPARTMENTS =====
  async getDepartments(token) {
    return this.get('/Departments', token);
  }

  async createDepartment(data, token) {
    return this.post('/Departments', data, token);
  }

  // ===== EQUIPMENT =====
  async getEquipment(token) {
    return this.get('/Equipment', token);
  }

  async getEquipmentById(id, token) {
    return this.get(`/Equipment/${id}`, token);
  }

  async createEquipment(data, token) {
    return this.post('/Equipment', data, token);
  }

  async updateEquipmentStatus(id, data, token) {
    return this.put(`/Equipment/${id}/status`, data, token);
  }

  async scheduleEquipmentService(id, data, token) {
    return this.post(`/Equipment/${id}/schedule-service`, data, token);
  }

  async getEquipmentStatusHistory(id, token) {
    return this.get(`/Equipment/${id}/status-history`, token);
  }

  async getEquipmentServiceOrders(id, token) {
    return this.get(`/Equipment/${id}/service-orders`, token);
  }

  // ===== APPOINTMENTS =====
  async getAppointments(token) {
    return this.get('/Appointment', token);
  }

  async getAppointmentById(id, token) {
    return this.get(`/Appointment/${id}`, token);
  }

  async createAppointment(data, token) {
    return this.post('/Appointment', data, token);
  }

  async rescheduleAppointment(id, data, token) {
    return this.put(`/Appointment/${id}/reschedule`, data, token);
  }

  async confirmAppointment(id, token) {
    return this.put(`/Appointment/${id}/confirm`, {}, token);
  }

  async cancelAppointment(id, data, token) {
    return this.put(`/Appointment/${id}/cancel`, data, token);
  }

  async getAppointmentsByDoctor(doctorId, token) {
    return this.get(`/Appointment/doctor/${doctorId}`, token);
  }

  async getAppointmentsByPatient(patientId, token) {
    return this.get(`/Appointment/patient/${patientId}`, token);
  }

  // ===== DOCTORS =====
  async getDoctors(token) {
    return this.get('/Doctors', token);
  }

  async createDoctor(data, token) {
    return this.post('/Doctors', data, token);
  }

  // ===== PATIENTS =====
  async getPatients(token) {
    return this.get('/Patients', token);
  }

  async createPatient(data, token) {
    return this.post('/Patients', data, token);
  }
  // ===== DOCTORS =====
  async getDoctors(token) {
    return this.get('/Doctors', token);
  }

  async getDoctorById(id, token) {
    return this.get(`/Doctors/${id}`, token);
  }

  async createDoctor(data, token) {
    return this.post('/Doctors', data, token);
  }

  // ===== PATIENTS =====
  async getPatients(token) {
    return this.get('/Patients', token);
  }

  async getPatientById(id, token) {
    return this.get(`/Patients/${id}`, token);
  }

  async createPatient(data, token) {
    return this.post('/Patients', data, token);
  }

  async updatePatient(id, data, token) {
    return this.put(`/Patients/${id}`, data, token);
  }

  async deletePatient(id, token) {
    return this.delete(`/Patients/${id}`, token);
  }
  // ===== MEDICAL SERVICES =====
  async getServices(token) {
    return this.get('/Services', token);
  }

  async createService(data, token) {
    return this.post('/Services', data, token);
  }

  // ===== PRICELIST =====
  async getPricelist(token) {
    return this.get('/PriceList', token);
  }

  async createPricelistItem(data, token) {
    return this.post('/PriceList', data, token);
  }

  // ===== AUDIT LOGS =====
  async getAuditLogs(filters, token) {
    const params = new URLSearchParams();
    if (filters.actor) params.append('actor', filters.actor);
    if (filters.action) params.append('action', filters.action);
    if (filters.path) params.append('path', filters.path);
    if (filters.statusCode) params.append('statusCode', filters.statusCode);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);
    
    return this.get(`/Audit?${params.toString()}`, token);
  }

  async getAuditSummary(startDate, endDate, token) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.get(`/Audit/summary?${params.toString()}`, token);
  }

  async exportAuditLogs(data, token) {
    return this.post('/Audit/export', data, token);
  }
// Confirm payment (for InsuranceAgency)
async confirmPayment(paymentId, token) {
  return this.put(`/Payments/${paymentId}/confirm`, {}, token);
}

  // ===== PAYMENTS =====
  async getPayments(token) {
    return this.get('/Payments', token);
  }
  // PreContracts
async getPreContracts(token) {
  return this.get('/PreContracts', token);
}


  async createPayment(formData, token) {
    return this.request('/Payments', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`
        // Ne dodavaj Content-Type za FormData, browser će automatski
      },
      body: formData // Šalji direkt FormData objekat
    });
  
  }
}

export const api = new ApiService();
export default api;