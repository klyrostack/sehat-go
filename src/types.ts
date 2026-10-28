export interface Appointment {
  patientName: string;
  fee: number;
  isConfirmed: boolean;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  district: string;
  fee: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  rating: number;
  reviews: string[];
  reviewCount: number;
}

export interface UserSession {
  name: string;
  role: "doctor" | "patient";
  clinic?: string;
  id?: number;
  identifier?: string;
}

export interface PatientRecord {
  id: number;
  name: string;
  identifier: string;
  password?: string;
}

export interface Booking {
  id: number;
  name: string;
  patientName: string;
  clinic: string;
  fee: number;
  date: string;
  time: string;
  status: "confirmed" | "completed" | "cancelled" | string;
}
