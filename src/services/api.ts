import axios from 'axios';
import {
  ApiResponse,
  AuthData,
  LoginRequest,
  Employee,
  EmployeeListResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AttendanceListResponse,
  GpsConfig,
  DashboardStats,
  UserInfo
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthData>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  setAuthData: (authData: AuthData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
};

export const employeeService = {
  getAllEmployees: async (): Promise<ApiResponse<EmployeeListResponse>> => {
    const response = await api.get('/employees');
    return response.data;
  },

  getEmployeeById: async (id: number): Promise<ApiResponse<Employee>> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData: CreateEmployeeRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id: number, employeeData: UpdateEmployeeRequest): Promise<ApiResponse<any>> => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

export const attendanceService = {
  getAllAttendance: async (employeeId?: string, startDate?: number, endDate?: number): Promise<ApiResponse<AttendanceListResponse>> => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (startDate) params.append('startDate', startDate.toString());
    if (endDate) params.append('endDate', endDate.toString());
    
    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
  },

  createManualAttendance: async (attendanceData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/attendance/manual', attendanceData);
    return response.data;
  },

  updateAttendance: async (id: number, attendanceData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  deleteAttendance: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },

  getGpsConfig: async (): Promise<ApiResponse<GpsConfig>> => {
    const response = await api.get('/attendance/gps-config');
    return response.data;
  },

  updateGpsConfig: async (gpsData: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/attendance/gps-config', gpsData);
    return response.data;
  }
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000;
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() / 1000;

    const [employeesResponse, attendanceResponse] = await Promise.all([
      employeeService.getAllEmployees(),
      attendanceService.getAllAttendance(undefined, startOfDay, endOfDay)
    ]);

    const totalEmployees = employeesResponse.data.totalCount;
    const todayAttendance = attendanceResponse.data.records;
    
    const presentToday = todayAttendance.filter(record => record.status === 'CHECKED_OUT' || record.status === 'CHECKED_IN').length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter(record => {
      const checkInTime = new Date(record.checkInTime * 1000);
      const workStartTime = new Date(checkInTime);
      workStartTime.setHours(9, 0, 0, 0);
      return checkInTime > workStartTime;
    }).length;

    return {
      totalEmployees,
      presentToday,
      absentToday,
      lateToday
    };
  }
};

export default api; 