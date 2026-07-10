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
  isActive?: boolean;
  role: string;
  startDate?: string;
  endDate?: string;
  certificateStatus?: string;
  agreementLink?: string | null;
  presentCount?: number;
  institution?: string | null;
  address?: string | null;
}

export interface AttendanceRecord {
  id: string;
  userId?: number;
  npk: string;
  employeeName: string;
  department: string;
  date: string;          // FE-04 FIX: field ini memang ada, tambahkan ke type
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  notes: string;
  logbook?: {
    id: string;
    activity: string;
    obstacle: string;
    documentLink?: string;
  } | null;
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
  date?: string;
  user?: {
    fullName: string;
    email: string;
  };
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
