import type { Patient, Session, Payment, CalendarEvent } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ana Clara Souza',
    email: 'anaclara@email.com',
    phone: '(11) 99234-5678',
    birthDate: '1990-03-15',
    gender: 'F',
    status: 'ativo',
    sessionValue: 180,
    paymentMethod: 'pix',
    paymentDueDay: 10,
    chiefComplaint: 'Ansiedade generalizada e dificuldades nos relacionamentos interpessoais.',
    medicalHistory: 'Histórico de ansiedade desde a adolescência. Fez terapia por 2 anos aos 22 anos. Sem internações.',
    medications: 'Sertralina 50mg (prescrita pelo psiquiatra Dr. Carlos)',
    createdAt: '2024-02-10',
    nextSession: '2026-05-26T10:00',
    totalSessions: 24,
    pendingPayment: 0,
  },
  {
    id: 'p2',
    name: 'Bruno Mendes',
    email: 'brunomendes@email.com',
    phone: '(21) 98765-4321',
    birthDate: '1985-07-22',
    gender: 'M',
    status: 'ativo',
    sessionValue: 200,
    paymentMethod: 'cartão',
    paymentDueDay: 5,
    chiefComplaint: 'Depressão moderada após separação. Dificuldade de adaptação e insônia.',
    medicalHistory: 'Separação conjugal em jan/2025. Episódio depressivo leve em 2019. Pai faleceu em 2023.',
    medications: 'Sem medicação atual',
    createdAt: '2025-01-15',
    nextSession: '2026-05-27T14:00',
    totalSessions: 16,
    pendingPayment: 200,
  },
  {
    id: 'p3',
    name: 'Carla Ferreira',
    email: 'carlafer@email.com',
    phone: '(31) 97654-3210',
    birthDate: '1998-11-08',
    gender: 'F',
    status: 'novo',
    sessionValue: 150,
    paymentMethod: 'pix',
    paymentDueDay: 15,
    chiefComplaint: 'Dificuldades de foco e procrastinação. Suspeita de TDAH não diagnosticado.',
    medicalHistory: 'Diagnóstico de TDAH em avaliação. Histórico familiar de transtornos de atenção.',
    medications: 'Nenhuma',
    createdAt: '2026-05-01',
    nextSession: '2026-05-28T09:00',
    totalSessions: 2,
    pendingPayment: 0,
  },
];

export const MOCK_SESSIONS: Session[] = [
  { id: 's1', patientId: 'p1', date: '2026-05-19', time: '10:00', duration: 50, status: 'realizada', notes: 'Paciente relatou melhora significativa na qualidade do sono. Trabalhamos técnicas de respiração para momentos de crise.', charged: true, value: 180 },
  { id: 's2', patientId: 'p1', date: '2026-05-12', time: '10:00', duration: 50, status: 'realizada', notes: 'Foco em identificação de gatilhos ansiosos no ambiente de trabalho. Tarefa: diário de pensamentos.', charged: true, value: 180 },
  { id: 's3', patientId: 'p1', date: '2026-05-05', time: '10:00', duration: 50, status: 'cancelada', notes: '', charged: false, value: 0 },
  { id: 's4', patientId: 'p2', date: '2026-05-20', time: '14:00', duration: 60, status: 'realizada', notes: 'Bruno demonstrou avanço no processo de aceitação. Iniciamos trabalho de reestruturação de rotinas pós-separação.', charged: false, value: 200 },
  { id: 's5', patientId: 'p2', date: '2026-05-13', time: '14:00', duration: 60, status: 'realizada', notes: 'Sessão intensa sobre luto pelo casamento. Técnica de EMDR iniciada.', charged: true, value: 200 },
  { id: 's6', patientId: 'p3', date: '2026-05-14', time: '09:00', duration: 50, status: 'realizada', notes: 'Primeira sessão de acompanhamento. Levantamento de histórico e queixas principais.', charged: true, value: 150 },
  { id: 's7', patientId: 'p3', date: '2026-05-07', time: '09:00', duration: 50, status: 'realizada', notes: 'Sessão de anamnese completa.', charged: true, value: 150 },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', patientId: 'p1', sessionId: 's1', date: '2026-05-19', amount: 180, status: 'pago', method: 'pix', description: 'Sessão 19/05' },
  { id: 'pay2', patientId: 'p1', sessionId: 's2', date: '2026-05-12', amount: 180, status: 'pago', method: 'pix', description: 'Sessão 12/05' },
  { id: 'pay3', patientId: 'p2', sessionId: 's4', date: '2026-05-20', amount: 200, status: 'pendente', method: 'cartão', description: 'Sessão 20/05' },
  { id: 'pay4', patientId: 'p2', sessionId: 's5', date: '2026-05-13', amount: 200, status: 'pago', method: 'cartão', description: 'Sessão 13/05' },
  { id: 'pay5', patientId: 'p3', sessionId: 's6', date: '2026-05-14', amount: 150, status: 'pago', method: 'pix', description: 'Sessão 14/05' },
  { id: 'pay6', patientId: 'p3', sessionId: 's7', date: '2026-05-07', amount: 150, status: 'pago', method: 'pix', description: 'Sessão 07/05' },
];

export const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'c1', patientId: 'p1', patientName: 'Ana Clara Souza', date: '2026-05-26', time: '10:00', duration: 50, status: 'agendada', recurrence: 'semanal' },
  { id: 'c2', patientId: 'p2', patientName: 'Bruno Mendes', date: '2026-05-27', time: '14:00', duration: 60, status: 'agendada', recurrence: 'semanal' },
  { id: 'c3', patientId: 'p3', patientName: 'Carla Ferreira', date: '2026-05-28', time: '09:00', duration: 50, status: 'agendada', recurrence: 'quinzenal' },
  { id: 'c4', patientId: 'p1', patientName: 'Ana Clara Souza', date: '2026-06-02', time: '10:00', duration: 50, status: 'agendada', recurrence: 'semanal' },
  { id: 'c5', patientId: 'p2', patientName: 'Bruno Mendes', date: '2026-06-03', time: '14:00', duration: 60, status: 'agendada', recurrence: 'semanal' },
  { id: 'c6', patientId: 'p1', patientName: 'Ana Clara Souza', date: '2026-05-19', time: '10:00', duration: 50, status: 'realizada', recurrence: 'semanal' },
  { id: 'c7', patientId: 'p2', patientName: 'Bruno Mendes', date: '2026-05-20', time: '14:00', duration: 60, status: 'realizada', recurrence: 'semanal' },
];

export const WEEKLY_REVENUE = [
  { week: 'Sem 1', value: 510 },
  { week: 'Sem 2', value: 730 },
  { week: 'Sem 3', value: 380 },
  { week: 'Sem 4', value: 910 },
];
