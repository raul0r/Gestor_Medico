
import React, { useState, useCallback } from 'react';
import { Appointment, Patient, Service, AppointmentStatus, PaymentMethod } from '../types';
import { Icon } from './Icon';

const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
        case AppointmentStatus.Scheduled: return 'bg-blue-100 border-blue-400 text-blue-800';
        case AppointmentStatus.Confirmed: return 'bg-yellow-100 border-yellow-400 text-yellow-800';
        case AppointmentStatus.Completed: return 'bg-green-100 border-green-400 text-green-800';
        case AppointmentStatus.Cancelled: return 'bg-red-100 border-red-400 text-red-800';
        default: return 'bg-gray-100 border-gray-400';
    }
};

const AppointmentCard: React.FC<{
    appointment: Appointment;
    patient?: Patient;
    service?: Service;
    onSelect: (app: Appointment) => void;
}> = ({ appointment, patient, service, onSelect }) => {
    const duration = (appointment.end.getTime() - appointment.start.getTime()) / (1000 * 60);

    return (
        <div
            onClick={() => onSelect(appointment)}
            className={`absolute w-full p-2 rounded-lg border cursor-pointer ${getStatusColor(appointment.status)}`}
            style={{
                top: `${(appointment.start.getHours() - 8 + appointment.start.getMinutes() / 60) * 4}rem`,
                height: `${(duration / 60) * 4}rem`,
            }}
        >
            <p className="font-bold text-sm truncate">{patient?.name}</p>
            <p className="text-xs truncate">{service?.name}</p>
            <p className="text-xs mt-1 opacity-70">{appointment.status}</p>
        </div>
    );
};

const AppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    // FIX: Updated type to allow for optional 'id' when saving an appointment.
    onSave: (app: Omit<Appointment, 'id' | 'end'> & { id?: string }) => void;
    onDelete: (id: string) => void;
    appointment: Partial<Appointment> | null;
    patients: Patient[];
    services: Service[];
}> = ({ isOpen, onClose, onSave, onDelete, appointment, patients, services }) => {
    const [patientId, setPatientId] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    React.useEffect(() => {
        if (appointment) {
            setPatientId(appointment.patientId || '');
            setServiceId(appointment.serviceId || '');
            if(appointment.start) {
                setDate(appointment.start.toISOString().split('T')[0]);
                setStartTime(appointment.start.toTimeString().substring(0, 5));
            } else {
                 setDate(new Date().toISOString().split('T')[0]);
                 setStartTime('09:00');
            }
        } else {
            setPatientId('');
            setServiceId('');
            setDate(new Date().toISOString().split('T')[0]);
            setStartTime('09:00');
        }
    }, [appointment]);
    
    if (!isOpen) return null;

    const handleSave = () => {
        if (!patientId || !serviceId) return;

        const [hours, minutes] = startTime.split(':').map(Number);
        const start = new Date(date);
        start.setHours(hours, minutes);
        start.setUTCHours(hours, minutes);


        onSave({
            ...appointment,
            patientId,
            serviceId,
            start,
            status: appointment?.status || AppointmentStatus.Scheduled,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{appointment?.id ? 'Editar Cita' : 'Nueva Cita'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><Icon name="close" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Paciente</label>
                        <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue">
                            <option value="">Seleccione un paciente</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Servicio</label>
                        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue">
                             <option value="">Seleccione un servicio</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
                        </select>
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Hora</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-between">
                     {appointment?.id && 
                        <button onClick={() => { onDelete(appointment.id!); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                           Eliminar
                        </button>
                    }
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark ml-auto">
                        Guardar Cita
                    </button>
                </div>
            </div>
        </div>
    );
};

const AgendaView: React.FC<{
    appointments: Appointment[];
    patients: Patient[];
    services: Service[];
    // FIX: Updated type to allow for optional 'id' when saving an appointment.
    onSaveAppointment: (app: Omit<Appointment, 'id' | 'end'> & { id?: string }) => void;
    onDeleteAppointment: (id: string) => void;
}> = ({ appointments, patients, services, onSaveAppointment, onDeleteAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Partial<Appointment> | null>(null);

    const openModal = (app?: Appointment) => {
        setSelectedAppointment(app || {});
        setIsModalOpen(true);
    };

    const timeSlots = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 7 PM

    const filteredAppointments = appointments.filter(app =>
        app.start.getDate() === currentDate.getDate() &&
        app.start.getMonth() === currentDate.getMonth() &&
        app.start.getFullYear() === currentDate.getFullYear()
    );

    const changeDate = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + offset);
            return newDate;
        });
    };

    return (
        <div className="p-6 bg-brand-gray-light h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                     <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>
                     <div className="flex items-center bg-white rounded-lg shadow-sm">
                        <button onClick={() => changeDate(-1)} className="p-2 text-gray-600 hover:text-brand-blue">&lt;</button>
                        <span className="font-semibold text-lg px-4">{currentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <button onClick={() => changeDate(1)} className="p-2 text-gray-600 hover:text-brand-blue">&gt;</button>
                     </div>
                </div>
                <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg shadow hover:bg-brand-blue-dark transition">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Nueva Cita
                </button>
            </header>

            <div className="bg-white rounded-lg shadow p-4 relative">
                <div className="grid grid-cols-[auto_1fr] gap-x-4">
                    {/* Time slots */}
                    <div className="text-right text-sm text-gray-500">
                        {timeSlots.map(hour => (
                            <div key={hour} className="h-16 flex items-start justify-end pr-2 pt-[-2px] border-r border-gray-200">
                                <span>{hour}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="relative">
                        {timeSlots.map(hour => (
                            <div key={hour} className="h-16 border-t border-gray-200"></div>
                        ))}
                        {filteredAppointments.map(app => {
                            const patient = patients.find(p => p.id === app.patientId);
                            const service = services.find(s => s.id === app.serviceId);
                            return <AppointmentCard key={app.id} appointment={app} patient={patient} service={service} onSelect={openModal} />;
                        })}
                    </div>
                </div>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSaveAppointment}
                onDelete={onDeleteAppointment}
                appointment={selectedAppointment}
                patients={patients}
                services={services}
            />
        </div>
    );
};

export default AgendaView;