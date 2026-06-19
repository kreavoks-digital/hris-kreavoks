export * from './auth'

export interface Employee {
  id: string;
  npk: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
  role: string;
}

export interface AttendanceRecord {
  id: string;
  npk: string;
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
  npk: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
  status: string;
}
