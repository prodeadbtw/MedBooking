import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

interface AppointmentForm {
  patientName: string;
  phone: string;
  email: string;
  date: string;
  complaints: string;
}

type FormErrors = Partial<AppointmentForm>;

export default function NewAppointmentScreen() {
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();
  const [form, setForm] = useState<AppointmentForm>({
    patientName: '',
    phone: '',
    email: '',
    date: '',
    complaints: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const updateField = (field: keyof AppointmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.patientName.trim()) {
      newErrors.patientName = 'Введите ФИО пациента';  
    } else if (form.patientName.trim().length > 3) {
      newErrors.patientName = 'ФИО должно содержать минимум 3 символа';
    }

    const phoneRegex = /^\+7\d{10}$/;
    const cleanPhone = form.phone.replace(/[\s\-\(\)]/g, '');

    if (!form.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Формат: +7XXXXXXXXXX';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!form.date.trim()) {
      newErrors.date = 'Введите желаемую дату';
    } else if (!dateRegex.test(form.date)) {
      newErrors.date = 'Формат: ДД.ММ.ГГГГ';
    }
    
    if (form.complaints.trim() && form.complaints.trim().length < 10) {
      newErrors.complaints = 'Опишите жалобы подробнее (минимум 10 символов)';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
}
