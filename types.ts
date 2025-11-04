
export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
}

export interface PatientFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface ConsultationNote {
  id: string;
  createdAt: string;
  content: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  demographics: {
    dob: string;
    gender: string;
  };
  notes: ConsultationNote[];
  files: PatientFile[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
  date: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  payment?: Payment;
}
   