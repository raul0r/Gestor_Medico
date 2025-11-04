
import { Patient, Service, Appointment, AppointmentStatus, PaymentMethod } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Carlos Vega',
    phone: '55-1234-5678',
    email: 'carlos.vega@email.com',
    demographics: { dob: '1985-05-20', gender: 'Male' },
    notes: [
        { id: 'n1', createdAt: '2023-10-15T10:30:00Z', content: 'Subjective: Patient reports mild chest pain after exercise.\nObjective: Blood pressure 130/85. EKG normal.\nAssessment: Suspected stable angina.\nPlan: Prescribe nitroglycerin, schedule stress test.' }
    ],
    files: [
        { id: 'f1', name: 'lab_results_oct23.pdf', url: '#', uploadedAt: '2023-10-15T11:00:00Z' }
    ],
  },
  {
    id: 'p2',
    name: 'Sofia Reyes',
    phone: '55-8765-4321',
    email: 'sofia.reyes@email.com',
    demographics: { dob: '1992-11-30', gender: 'Female' },
    notes: [],
    files: [],
  },
  {
    id: 'p3',
    name: 'Roberto Fernandez',
    phone: '55-5555-5555',
    email: 'roberto.f@email.com',
    demographics: { dob: '1978-01-12', gender: 'Male' },
    notes: [],
    files: [],
  }
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Consulta General', price: 800 },
  { id: 's2', name: 'Consulta de Seguimiento', price: 500 },
  { id: 's3', name: 'Electrocardiograma', price: 1200 },
];

const today = new Date();
const getTodayAt = (hour: number, minute: number = 0) => {
    const d = new Date(today);
    d.setHours(hour, minute, 0, 0);
    return d;
}

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    serviceId: 's1',
    start: getTodayAt(9, 0),
    end: getTodayAt(9, 45),
    status: AppointmentStatus.Completed,
    payment: { method: PaymentMethod.Card, amount: 800, date: getTodayAt(9, 45).toISOString() }
  },
  {
    id: 'a2',
    patientId: 'p2',
    serviceId: 's2',
    start: getTodayAt(10, 0),
    end: getTodayAt(10, 30),
    status: AppointmentStatus.Scheduled,
  },
  {
    id: 'a3',
    patientId: 'p3',
    serviceId: 's1',
    start: getTodayAt(11, 0),
    end: getTodayAt(11, 45),
    status: AppointmentStatus.Confirmed,
  },
  {
    id: 'a4',
    patientId: 'p1',
    serviceId: 's3',
    start: getTodayAt(12, 0),
    end: getTodayAt(12, 30),
    status: AppointmentStatus.Scheduled,
  }
];
   