export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: 'EMPLOYEE' | 'ADMIN';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: 'EMPLOYEE' | 'ADMIN';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  checkInTime: number;
  checkOutTime: number;
  checkInLocation: string;
  checkOutLocation: string;
  distanceFromOffice: number;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'INCOMPLETE';
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface AuthData {
  token: string;
  expiresIn: number;
  user: {
    id: number;
    employeeId: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  address?: string;
  password: string;
  role?: 'EMPLOYEE' | 'ADMIN';
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  role?: 'EMPLOYEE' | 'ADMIN';
  active?: boolean;
}

export interface AttendanceListResponse {
  records: AttendanceRecord[];
  totalCount: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  totalCount: number;
}

export interface GpsConfig {
  id?: number;
  officeLatitude: number;
  officeLongitude: number;
  allowedRadius: number;
  gpsValidationEnabled?: boolean;
  locationName?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
} 