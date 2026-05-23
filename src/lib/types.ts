export type PatientStatus = 'ativo' | 'inativo' | 'novo';
export type SessionStatus = 'realizada' | 'cancelada' | 'faltou' | 'agendada';
export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartão' | 'transferência';
export type Recurrence = 'única' | 'semanal' | 'quinzenal';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'outro';
  status: PatientStatus;
  sessionValue: number;
  paymentMethod: PaymentMethod;
  paymentDueDay: number;
  chiefComplaint: string;
  medicalHistory: string;
  medications: string;
  createdAt: string;
  nextSession?: string;
  totalSessions: number;
  pendingPayment: number;
}

export interface Session {
  id: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  status: SessionStatus;
  notes?: string;
  audioUrl?: string;
  charged: boolean;
  value: number;
}

export interface Payment {
  id: string;
  patientId: string;
  sessionId?: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  description: string;
}

export interface CalendarEvent {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  status: SessionStatus;
  recurrence: Recurrence;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
