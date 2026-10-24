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
