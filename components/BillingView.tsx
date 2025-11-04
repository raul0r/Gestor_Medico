
import React, { useState } from 'react';
import { Appointment, Patient, Service, AppointmentStatus, PaymentMethod } from '../types';
import { Icon } from './Icon';

const RegisterPaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointmentId: string, payment: { method: PaymentMethod; amount: number }) => void;
    appointment: Appointment;
    service?: Service;
}> = ({ isOpen, onClose, onSave, appointment, service }) => {
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Card);

    if (!isOpen) return null;

    const handleSave = () => {
        if (service) {
            onSave(appointment.id, { method, amount: service.price });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Registrar Pago</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><Icon name="close" /></button>
                </div>
                <div className="space-y-4">
                   <p className="text-lg">Monto a cobrar: <span className="font-bold">${service?.price}</span></p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue">
                            <option value={PaymentMethod.Card}>Tarjeta</option>
                            <option value={PaymentMethod.Cash}>Efectivo</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-dark">
                        <Icon name="check" className="w-5 h-5 mr-2" />
                        Confirmar Pago
                    </button>
                </div>
            </div>
        </div>
    );
};

const BillingView: React.FC<{
    appointments: Appointment[];
    patients: Patient[];
    services: Service[];
    onRegisterPayment: (appointmentId: string, payment: { method: PaymentMethod; amount: number }) => void;
}> = ({ appointments, patients, services, onRegisterPayment }) => {
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysAppointments = appointments.filter(app => {
        const appDate = new Date(app.start);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() === today.getTime();
    });

    const dailyReport = todaysAppointments.reduce((acc, curr) => {
        if (curr.payment) {
            acc.total += curr.payment.amount;
            if (curr.payment.method === PaymentMethod.Card) {
                acc.card += curr.payment.amount;
            } else {
                acc.cash += curr.payment.amount;
            }
        }
        return acc;
    }, { total: 0, card: 0, cash: 0 });


    return (
        <div className="p-6 bg-brand-gray-light h-full overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Report */}
            <div className="md:col-span-1 space-y-6">
                 <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Reporte de Caja (Hoy)</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-brand-blue-light rounded-md">
                            <span className="font-semibold text-brand-blue-dark">Total Ingresado</span>
                            <span className="font-bold text-lg text-brand-blue-dark">${dailyReport.total.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                            <span className="flex items-center text-gray-600"><Icon name="card" className="w-5 h-5 mr-2"/>Tarjeta</span>
                            <span className="font-semibold text-gray-800">${dailyReport.card.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                            <span className="flex items-center text-gray-600"><Icon name="cash" className="w-5 h-5 mr-2"/>Efectivo</span>
                            <span className="font-semibold text-gray-800">${dailyReport.cash.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Catálogo de Servicios</h2>
                    <ul className="divide-y divide-gray-200">
                        {services.map(service => (
                            <li key={service.id} className="py-3 flex justify-between">
                                <span className="text-gray-800">{service.name}</span>
                                <span className="font-semibold text-gray-600">${service.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Today's appointments for payment */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold mb-4 text-gray-700">Citas del Día para Cobro</h2>
                 <div className="space-y-3">
                    {todaysAppointments.map(app => {
                        const patient = patients.find(p => p.id === app.patientId);
                        const service = services.find(s => s.id === app.serviceId);
                        return (
                            <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-bold">{patient?.name}</p>
                                    <p className="text-sm text-gray-600">{service?.name}</p>
                                    <p className="text-xs text-gray-500">{app.start.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                {app.payment ? (
                                    <div className="flex items-center text-brand-green-dark bg-brand-green-light px-3 py-1 rounded-full">
                                        <Icon name="check" className="w-4 h-4 mr-2"/> Pagado
                                    </div>
                                ) : (
                                    <button onClick={() => setSelectedAppointment(app)} className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-500">
                                        Registrar Pago
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {todaysAppointments.length === 0 && <p className="text-gray-500 text-center py-4">No hay citas programadas para hoy.</p>}
                 </div>
            </div>

            {selectedAppointment && 
                <RegisterPaymentModal 
                    isOpen={!!selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onSave={onRegisterPayment}
                    appointment={selectedAppointment}
                    service={services.find(s => s.id === selectedAppointment.serviceId)}
                />
            }
        </div>
    );
};

export default BillingView;
   