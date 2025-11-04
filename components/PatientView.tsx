
import React, { useState } from 'react';
import { Patient, Appointment, Service, ConsultationNote, PatientFile } from '../types';
import { Icon } from './Icon';

const PatientProfile: React.FC<{
  patient: Patient;
  appointments: Appointment[];
  services: Service[];
  onAddNote: (patientId: string, content: string) => void;
  onAddFile: (patientId: string, file: File) => void;
  onBack: () => void;
}> = ({ patient, appointments, services, onAddNote, onAddFile, onBack }) => {
    const [newNote, setNewNote] = useState('');

    const handleNoteSave = () => {
        if (newNote.trim()) {
            onAddNote(patient.id, newNote);
            setNewNote('');
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            onAddFile(patient.id, e.target.files[0])
        }
    }

    const patientAppointments = appointments.filter(a => a.patientId === patient.id).sort((a,b) => b.start.getTime() - a.start.getTime());

  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center text-brand-blue mb-4">&lt; Volver a la lista</button>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-start justify-between">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">{patient.name}</h2>
                <div className="flex space-x-6 mt-2 text-gray-600">
                    <span className="flex items-center"><Icon name="phone" className="w-4 h-4 mr-2" />{patient.phone}</span>
                    <span className="flex items-center"><Icon name="email" className="w-4 h-4 mr-2" />{patient.email}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                <p className="font-semibold">{patient.demographics.dob}</p>
                 <p className="text-sm text-gray-500 mt-2">Género</p>
                <p className="font-semibold">{patient.demographics.gender}</p>
            </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notes Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Notas de Consulta</h3>
             <div className="bg-brand-gray-light p-4 rounded-lg">
                <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribir nueva nota (formato SOAP)..."
                    className="w-full h-32 p-2 border rounded-md"
                />
                <button onClick={handleNoteSave} className="mt-2 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark">Guardar Nota</button>
            </div>
            <div className="space-y-4 mt-4 max-h-60 overflow-y-auto pr-2">
                {patient.notes.map(note => (
                    <div key={note.id} className="bg-white p-3 border rounded-md shadow-sm">
                        <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</p>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                    </div>
                ))}
            </div>
          </div>

          {/* Appointments and Files */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Historial</h3>
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {patientAppointments.map(app => {
                    const service = services.find(s => s.id === app.serviceId);
                    return (
                        <div key={app.id} className="bg-white p-3 border rounded-md shadow-sm">
                            <p className="font-bold">{service?.name}</p>
                            <p className="text-sm text-gray-600">{app.start.toLocaleString('es-MX')}</p>
                            <p className={`text-sm font-semibold ${app.status === 'Completed' ? 'text-green-600' : 'text-gray-500'}`}>{app.status}</p>
                        </div>
                    )
                })}
             </div>
             <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Archivos Adjuntos</h3>
                <div className="bg-brand-gray-light p-4 rounded-lg">
                    <label className="w-full flex items-center justify-center px-4 py-2 bg-white text-brand-blue rounded-md shadow-sm tracking-wide uppercase border border-blue cursor-pointer hover:bg-brand-blue hover:text-white">
                        <Icon name="file" className="w-5 h-5 mr-2" />
                        <span className="text-base leading-normal">Subir Archivo</span>
                        <input type='file' className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                 <div className="space-y-2 mt-4">
                    {patient.files.map(file => (
                        <a href={file.url} key={file.id} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-white border rounded-md hover:bg-gray-50">
                            <Icon name="file" className="w-5 h-5 mr-3 text-brand-blue"/>
                            <span className="text-sm">{file.name}</span>
                             <span className="text-xs text-gray-500 ml-auto">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </a>
                    ))}
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const PatientView: React.FC<{
  patients: Patient[];
  appointments: Appointment[];
  services: Service[];
  onSavePatient: (patient: Omit<Patient, 'id' | 'notes' | 'files'>) => void;
  onAddNote: (patientId: string, content: string) => void;
  onAddFile: (patientId: string, file: File) => void;
}> = ({ patients, appointments, services, onSavePatient, onAddNote, onAddFile }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (selectedPatient) {
    return <PatientProfile 
        patient={selectedPatient} 
        appointments={appointments} 
        services={services}
        onAddNote={onAddNote}
        onAddFile={onAddFile}
        onBack={() => setSelectedPatient(null)} 
    />;
  }

  return (
    <div className="p-6 bg-brand-gray-light h-full overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
            {/* New patient button could be added here */}
        </header>

        <div className="mb-4">
            <input
                type="text"
                placeholder="Buscar paciente por nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm"
            />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {filteredPatients.map(patient => (
                    <li key={patient.id} onClick={() => setSelectedPatient(patient)} className="p-4 hover:bg-brand-gray-light cursor-pointer flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-brand-blue-dark">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                        </div>
                         <span className="text-xs text-gray-400">&gt;</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default PatientView;
   