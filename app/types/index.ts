export * from './auth'

export interface Employee {
  id: string;
  nik: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
}

export interface AttendanceRecord {
  id: string;
  nik: string;
  employeeName: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
}

export interface AttendanceSummary {
  present: number;
  permission: number;
  sick: number;
  absent: number;
}

export interface LeaveRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  nik: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
  status: string;
}
