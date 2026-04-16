export interface Appointment {
  id: string;              // Уникальный идентификатор записи
  doctorId: string;        // ID врача
  doctorName: string;      // Имя врача (дублируем для удобства отображения)
  patientName: string;     // ФИО пациента
  phone: string;           // Телефон
  email: string;           // Email
  date: string;            // Дата приёма (ISO-строка)
  complaints: string;      // Жалобы
  createdAt: string;       // Дата создания записи (ISO-строка)
  status: AppointmentStatus; // Статус записи
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждена',
    completed: 'Завершена',
    cancelled: 'Отменена',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
    pending: '#D69E2E',
    confirmed: '#38A169',
    completed: '#718096',
    cancelled: '#E53E3E',
};