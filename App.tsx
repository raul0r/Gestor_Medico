
import React, { useState, useCallback } from 'react';
import AgendaView from './components/AgendaView';
import PatientView from './components/PatientView';
import BillingView from './components/BillingView';
import { Icon } from './components/Icon';
import { Appointment, Patient, Service, AppointmentStatus, ConsultationNote, PatientFile } from './types';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS, MOCK_SERVICES } from './constants';

type View = 'agenda' | 'patients' | 'billing';

const Sidebar: React.FC<{ activeView: View; setActiveView: (view: View) => void }> = ({ activeView, setActiveView }) => {
    const navItems: { id: View; name: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
        { id: 'agenda', name: 'Agenda', icon: 'calendar' },
        { id: 'patients', name: 'Pacientes', icon: 'patients' },
        { id: 'billing', name: 'Cobros', icon: 'billing' },
    ];

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-gray-700">
                Gestor Médico Pro
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                            activeView === item.id ? 'bg-brand-blue text-white' : 'hover:bg-gray-700'
                        }`}
                    >
                        <Icon name={item.icon} className="w-6 h-6 mr-4" />
                        <span className="font-semibold">{item.name}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center font-bold">
                        AL
                    </div>
                    <div className="ml-3">
                        <p className="font-semibold">Dra. Ana López</p>
                        <p className="text-sm text-gray-400">Cardióloga</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('agenda');
    const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
    const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);

    // FIX: Corrected the type of `app` to allow for an optional `id`.
    const handleSaveAppointment = useCallback((app: Omit<Appointment, 'id' | 'end'> & { id?: string }) => {
        setAppointments(prev => {
            const service = services.find(s => s.id === app.serviceId);
            const duration = service?.name.includes('Seguimiento') ? 30 : 45;
            const end = new Date(app.start.getTime() + duration * 60 * 1000);

            // FIX: The `app` type now correctly allows checking for `app.id`.
            if (app.id) { // Editing existing appointment
                // FIX: The `app` type now correctly allows accessing `app.id`.
                return prev.map(a => a.id === app.id ? { ...a, ...app, end } : a);
            } else { // Creating new one
                const newId = `a${Date.now()}`;
                return [...prev, { ...app, id: newId, end }];
            }
        });
    }, [services]);

    const handleDeleteAppointment = useCallback((id: string) => {
        setAppointments(prev => prev.filter(app => app.id !== id));
    }, []);

    const handleAddNote = useCallback((patientId: string, content: string) => {
        const newNote: ConsultationNote = {
            id: `n${Date.now()}`,
            createdAt: new Date().toISOString(),
            content,
        };
        setPatients(prev => prev.map(p => 
            p.id === patientId ? { ...p, notes: [newNote, ...p.notes] } : p
        ));
    }, []);

    const handleAddFile = useCallback((patientId: string, file: File) => {
        const newFile: PatientFile = {
            id: `f${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
        };
         setPatients(prev => prev.map(p => 
            p.id === patientId ? { ...p, files: [newFile, ...p.files] } : p
        ));
    }, []);
    
    const handleRegisterPayment = useCallback((appointmentId: string, payment: { method: any; amount: number }) => {
        setAppointments(prev => prev.map(app => {
            if (app.id === appointmentId) {
                return {
                    ...app,
                    status: AppointmentStatus.Completed,
                    payment: {
                        ...payment,
                        date: new Date().toISOString(),
                    }
                }
            }
            return app;
        }));
    }, []);

    const renderView = () => {
        switch (activeView) {
            case 'agenda':
                return <AgendaView 
                    appointments={appointments} 
                    patients={patients} 
                    services={services} 
                    onSaveAppointment={handleSaveAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                />;
            case 'patients':
                return <PatientView 
                    patients={patients} 
                    appointments={appointments} 
                    services={services}
                    onSavePatient={() => {}} // Placeholder for future use
                    onAddNote={handleAddNote}
                    onAddFile={handleAddFile}
                />;
            case 'billing':
                return <BillingView
                    appointments={appointments}
                    patients={patients}
                    services={services}
                    onRegisterPayment={handleRegisterPayment}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="h-screen w-screen flex bg-gray-100 font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 flex flex-col overflow-hidden">
                {renderView()}
            </main>
        </div>
    );
};

export default App;