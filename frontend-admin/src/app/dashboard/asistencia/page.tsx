"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, LogOut, CheckCircle, XCircle, FileDown, PlusCircle, Trash2, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- INTERFACES ---
interface Usuario { id: string; nombre: string; email: string; }
interface Fichaje { tipo: 'entrada' | 'salida'; timestamp: string; usuario?: Usuario; }
interface RegistroHoy { usuario: { id: string; nombre: string; }; fichajes: Fichaje[]; }
interface ReporteDia { fecha: string; turnos: { entrada: string; salida: string; }[]; horasDia: number; ausencia?: string; }
interface Ausencia { id: string; motivo: string; notas?: string; fechaInicio: string; fechaFin: string; certificadoUrl?: string; }
interface Status { message: string; type: 'success' | 'error' | ''; }

// --- HELPER FUNCTIONS ---
const formatHoras = (horasDecimal: number): string => {
    if (isNaN(horasDecimal)) return '00h 00m';
    const horas = Math.floor(horasDecimal);
    const minutos = Math.round((horasDecimal * 60) % 60);
    return `${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}m`;
};

// --- COMPONENTE PRINCIPAL ---
export default function AsistenciaPage() {
    const { token } = useAuth();
    
    // Estados Globales
    const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
    const [status, setStatus] = useState<Status>({ message: '', type: '' });

    // Estados para Fichaje en Vivo
    const [registrosHoy, setRegistrosHoy] = useState<RegistroHoy[]>([]);
    const [loadingVivo, setLoadingVivo] = useState(true);
    const [selectedFichajeUserId, setSelectedFichajeUserId] = useState('');
    
    // Estados para Gestión de Ausencias
    const [ausencias, setAusencias] = useState<Ausencia[]>([]);
    const [loadingAusencias, setLoadingAusencias] = useState(false);
    const [selectedAusenciaUserId, setSelectedAusenciaUserId] = useState('');
    const [nuevaAusencia, setNuevaAusencia] = useState({ motivo: '', fechaInicio: '', fechaFin: '', notas: '' });
    const [certificadoFile, setCertificadoFile] = useState<File | null>(null);

    // Estados para Reportería
    const [fichajesReporte, setFichajesReporte] = useState<Fichaje[]>([]);
    const [ausenciasReporte, setAusenciasReporte] = useState<Ausencia[]>([]);
    const [loadingReporte, setLoadingReporte] = useState(false);
    const [selectedReporteUserId, setSelectedReporteUserId] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 8) + '01');
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));

    // --- LÓGICA DE DATOS ---
    const fetchData = async () => {
        if (!token) return;
        setLoadingVivo(true);
        try {
            const [resFuncionarios, resRegistros] = await Promise.all([
                fetch('http://200.58.121.205:3523/usuarios/v1', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://200.58.121.205:3523/asistencia/v1/registros/hoy', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!resFuncionarios.ok) throw new Error('Error al cargar funcionarios');
            if (!resRegistros.ok) throw new Error('Error al cargar registros del día');
            setFuncionarios(await resFuncionarios.json());
            setRegistrosHoy(await resRegistros.json());
        } catch (error: any) {
            setStatus({ message: error.message, type: 'error' });
        } finally {
            setLoadingVivo(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleFichaje = async (usuarioId: string, tipo: 'entrada' | 'salida') => {
        setStatus({ message: '', type: ''});
        try {
            const apiUrl = `http://200.58.121.205:3523/asistencia/v1/fichar/${tipo}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al procesar el fichaje');
            setStatus({ message: `Fichaje de ${tipo} registrado correctamente.`, type: 'success'});
            await fetchData();
        } catch (error: any) {
            setStatus({ message: `Error: ${error.message}`, type: 'error' });
        }
    };

    const handleSelectAusenciaUser = (userId: string) => {
        setSelectedAusenciaUserId(userId);
        if (!userId) {
            setAusencias([]);
            return;
        }
        const fetchAusencias = async () => {
            setLoadingAusencias(true);
            try {
                const response = await fetch(`http://200.58.121.205:3523/ausencias/usuario/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error("No se pudieron cargar las ausencias.");
                setAusencias(await response.json());
            } catch (error: any) {
                setStatus({ message: error.message, type: 'error' });
            } finally {
                setLoadingAusencias(false);
            }
        };
        fetchAusencias();
    };

    const handleCrearAusencia = async () => {
        if (!selectedAusenciaUserId || !nuevaAusencia.motivo || !nuevaAusencia.fechaInicio || !nuevaAusencia.fechaFin) {
            setStatus({ message: 'Completa todos los campos requeridos para la ausencia.', type: 'error' });
            return;
        }
        setStatus({ message: '', type: ''});
        setLoadingAusencias(true);
        try {
            const resAusencia = await fetch('http://200.58.121.205:3523/ausencias', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...nuevaAusencia, usuarioId: selectedAusenciaUserId })
            });
            const dataAusencia = await resAusencia.json();
            if (!resAusencia.ok) throw new Error(dataAusencia.message || "Error al crear la ausencia.");
            if (certificadoFile) {
                const formData = new FormData();
                formData.append('file', certificadoFile);
                const resCertificado = await fetch(`http://200.58.121.205:3523/ausencias/${dataAusencia.id}/certificado`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!resCertificado.ok) throw new Error("La ausencia se creó, pero falló la subida del certificado.");
            }
            setStatus({ message: 'Ausencia registrada con éxito.', type: 'success' });
            handleSelectAusenciaUser(selectedAusenciaUserId);
            setNuevaAusencia({ motivo: '', fechaInicio: '', fechaFin: '', notas: '' });
            setCertificadoFile(null);
        } catch (error: any) {
            setStatus({ message: `Error: ${error.message}`, type: 'error' });
        } finally {
            setLoadingAusencias(false);
        }
    };
    
    const handleRemoveAusencia = async (ausenciaId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
        try {
            const response = await fetch(`http://200.58.121.205:3523/ausencias/${ausenciaId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error al eliminar la ausencia.");
            setAusencias(prev => prev.filter(a => a.id !== ausenciaId));
            setStatus({ message: 'Ausencia eliminada.', type: 'success' });
        } catch (error: any) {
            setStatus({ message: error.message, type: 'error' });
        }
    };

    const handleSearchReporte = async () => {
        if (!selectedReporteUserId) return;
        setLoadingReporte(true);
        setFichajesReporte([]);
        setAusenciasReporte([]);
        try {
            const urlFichajes = `http://200.58.121.205:3523/asistencia/v1/reporte/${selectedReporteUserId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            const resFichajes = await fetch(urlFichajes, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!resFichajes.ok) throw new Error("Error al obtener los fichajes del reporte.");
            setFichajesReporte(await resFichajes.json());

            // También buscamos las ausencias para el reporte
            if (selectedReporteUserId !== 'todos') {
                const urlAusencias = `http://200.58.121.205:3523/ausencias/usuario/${selectedReporteUserId}`;
                const resAusencias = await fetch(urlAusencias, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!resAusencias.ok) throw new Error("Error al obtener las ausencias del reporte.");
                setAusenciasReporte(await resAusencias.json());
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoadingReporte(false);
        }
    };
    
    const reporteProcesado = useMemo(() => {
    // 1. Crear un mapa de todas las fechas del rango
    const rangoDeFechas = new Map<string, ReporteDia>();
    if (fechaInicio && fechaFin) {
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const fechaStr = d.toISOString().slice(0, 10);
            rangoDeFechas.set(fechaStr, { fecha: fechaStr, turnos: [], horasDia: 0 });
        }
    }
    
    // 2. Procesar fichajes y añadirlos al mapa de fechas
    const porUsuario = fichajesReporte.reduce((acc, fichaje) => {
        // Aseguramos que el fichaje tiene un usuario asociado
        if (!fichaje.usuario) return acc;
        
        const uid = fichaje.usuario.id;
        if (!acc[uid]) {
            acc[uid] = {
                usuario: fichaje.usuario,
                fichajes: []
            };
        }
        acc[uid].fichajes.push(fichaje);
        return acc;
    }, {} as { [key: string]: { usuario: Usuario, fichajes: Fichaje[] } });

    // 3. Procesar ausencias y añadirlas al mapa de fechas
    ausenciasReporte.forEach(ausencia => {
        const start = new Date(ausencia.fechaInicio);
        const end = new Date(ausencia.fechaFin);
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const fechaStr = d.toISOString().slice(0, 10);
            Object.values(porUsuario).forEach((userData: any) => {
                if (userData.dias.has(fechaStr) && userData.usuario.id === (ausencia as any).usuario.id) {
                    userData.dias.get(fechaStr)!.ausencia = ausencia.motivo.replace(/_/g, ' ');
                }
            });
        }
    });

    // 4. Calcular horas y turnos para cada día de cada usuario
    Object.values(porUsuario).forEach(userData => {
        const diasDelUsuario = userData.fichajes.reduce((diasAcc, fichaje) => {
            const dia = new Date(fichaje.timestamp).toISOString().slice(0, 10);
            if (!diasAcc[dia]) {
                // Creamos una entrada para el día si no existe
                diasAcc[dia] = { fecha: dia, turnos: [], horasDia: 0 };
            }
            return diasAcc;
        }, {} as { [key: string]: ReporteDia });

        // Ahora calculamos los turnos y horas para cada día de ESTE usuario
        for (const fecha in diasDelUsuario) {
            const fichajesDelDia = userData.fichajes.filter(f => new Date(f.timestamp).toISOString().slice(0, 10) === fecha);
            
            for (let i = 0; i < fichajesDelDia.length; i += 2) {
                const entrada = fichajesDelDia[i];
                const salida = fichajesDelDia[i + 1];
                if (entrada && salida) {
                    const diff = new Date(salida.timestamp).getTime() - new Date(entrada.timestamp).getTime();
                    diasDelUsuario[fecha].horasDia += diff / (1000 * 60 * 60);
                    diasDelUsuario[fecha].turnos.push({
                        entrada: new Date(entrada.timestamp).toLocaleTimeString('es-AR'),
                        salida: new Date(salida.timestamp).toLocaleTimeString('es-AR'),
                    });
                }
            }
        }
        // Asignamos el reporte procesado y ordenado al objeto del usuario
        (userData as any).reporte = Object.values(diasDelUsuario).sort((a,b) => a.fecha.localeCompare(b.fecha));
    });

    return Object.values(porUsuario);
}, [fichajesReporte]);
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const funcionarioSeleccionado = funcionarios.find(f => f.id === selectedReporteUserId);
        const title = selectedReporteUserId === 'todos' ? 'Reporte General de Asistencia' : `Reporte para: ${funcionarioSeleccionado?.nombre}`;
        const periodo = `Periodo: ${fechaInicio} al ${fechaFin}`;

        doc.text(title, 14, 20);
        doc.text(periodo, 14, 28);
        let finalY = 35;

        reporteProcesado.forEach((data: any) => {
            doc.text(data.usuario.nombre, 14, finalY);
            const totalHorasFuncionario = data.reporte.reduce((acc: number, dia: any) => acc + dia.horasDia, 0);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Fecha', 'Turnos', 'Horas del Día']],
                body: data.reporte.map((dia: any) => [ dia.fecha, dia.turnos.map((t: any) => `${t.entrada} - ${t.salida}`).join('\n'), formatHoras(dia.horasDia)]),
            });
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY,
                theme: 'plain',
                body: [['', 'Total Funcionario:', formatHoras(totalHorasFuncionario)]],
                bodyStyles: { fontStyle: 'bold' }
            });
            finalY = (doc as any).lastAutoTable.finalY + 15;
        });

        doc.save(`reporte-asistencia.pdf`);
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold">Control de Asistencia y Personal</h1>
            
            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Registro y Estado en Vivo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-1">Funcionario</label>
                        <Select onValueChange={setSelectedFichajeUserId} value={selectedFichajeUserId}>
                            <SelectTrigger><SelectValue placeholder="Selecciona un empleado..." /></SelectTrigger>
                            <SelectContent>{funcionarios.map(f => <SelectItem key={f.id} value={f.id}>{f.nombre || f.email}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-4 md:col-span-2">
                        <Button onClick={() => handleFichaje(selectedFichajeUserId, 'entrada')} disabled={!selectedFichajeUserId} className="flex-1 bg-green-600 hover:bg-green-700">Marcar Entrada</Button>
                        <Button onClick={() => handleFichaje(selectedFichajeUserId, 'salida')} disabled={!selectedFichajeUserId} className="flex-1 bg-red-600 hover:bg-red-700">Marcar Salida</Button>
                    </div>
                </div>
                {status.message && (
                    <p className={`text-center font-semibold ${status.type === 'success' ? 'text-green-400' : 'text-red-500'}`}>{status.message}</p>
                )}
                
                <div className="mt-6 space-y-3">
                    {loadingVivo ? <p className="text-center text-gray-400">Cargando...</p> : 
                    registrosHoy.length > 0 ? registrosHoy.map(registro => {
                        const ultimoFichaje = registro.fichajes[registro.fichajes.length - 1];
                        const estaActivo = ultimoFichaje?.tipo === 'entrada';
                        const turnos = [];
                        for (let i = 0; i < registro.fichajes.length; i += 2) {
                            const entrada = registro.fichajes[i];
                            const salida = registro.fichajes[i + 1];
                            turnos.push({
                                entrada: new Date(entrada.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit'}),
                                salida: salida ? new Date(salida.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit'}) : 'Presente'
                            });
                        }
                        return (
                        <div key={registro.usuario.id} className={`flex items-center justify-between p-4 rounded-lg ${estaActivo ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <div className="flex items-center gap-4">
                                {estaActivo ? <CheckCircle className="text-green-400"/> : <XCircle className="text-red-400"/>}
                                <div>
                                    <p className="font-bold text-lg">{registro.usuario.nombre}</p>
                                    <div className="flex gap-x-4 gap-y-1 text-sm text-gray-400 flex-wrap">
                                        {turnos.map((turno, index) => (
                                            <span key={index} className="flex items-center gap-1"><Clock size={14}/> {turno.entrada} - {turno.salida}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {estaActivo && (
                            <Button size="sm" variant="destructive" onClick={() => handleFichaje(registro.usuario.id, 'salida')}>
                                <LogOut size={16} className="mr-2"/> Marcar Salida
                            </Button>
                            )}
                        </div>
                        );
                    }) : <p className="text-center text-gray-500">No hay fichajes registrados hoy.</p>}
                </div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Gestión de Ausencias y Legajo</h2>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Funcionario</label>
                    <Select onValueChange={handleSelectAusenciaUser} value={selectedAusenciaUserId}>
                        <SelectTrigger><SelectValue placeholder="Selecciona un funcionario..." /></SelectTrigger>
                        <SelectContent>{funcionarios.map(f => <SelectItem key={f.id} value={f.id}>{f.nombre || f.email}</SelectItem>)}</SelectContent>
                    </Select>
                </div>

                {selectedAusenciaUserId && (
                <>
                    <div className="mb-8 p-4 border border-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Registrar Nueva Ausencia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Select onValueChange={(value) => setNuevaAusencia(prev => ({ ...prev, motivo: value }))} value={nuevaAusencia.motivo}>
                                <SelectTrigger><SelectValue placeholder="Motivo..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="enfermedad">Enfermedad</SelectItem>
                                    <SelectItem value="vacaciones">Vacaciones</SelectItem>
                                    <SelectItem value="asunto_personal">Asunto Personal</SelectItem>
                                    <SelectItem value="falta_justificada">Falta Justificada</SelectItem>
                                    <SelectItem value="falta_injustificada">Falta Injustificada</SelectItem>
                                    <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="date" value={nuevaAusencia.fechaInicio} onChange={e => setNuevaAusencia(prev => ({...prev, fechaInicio: e.target.value}))}/>
                            <Input type="date" value={nuevaAusencia.fechaFin} onChange={e => setNuevaAusencia(prev => ({...prev, fechaFin: e.target.value}))}/>
                            <Textarea placeholder="Notas adicionales..." value={nuevaAusencia.notas} onChange={e => setNuevaAusencia(prev => ({...prev, notas: e.target.value}))} className="lg:col-span-4"/>
                            <div className="lg:col-span-3">
                                <label className="block text-sm font-medium mb-1">Adjuntar Certificado (PDF, JPG, PNG)</label>
                                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertificadoFile(e.target.files ? e.target.files[0] : null)} className="bg-gray-700"/>
                            </div>
                            <Button onClick={handleCrearAusencia} disabled={loadingAusencias} className="mt-2 self-end">
                                <PlusCircle size={16} className="mr-2"/> Registrar
                            </Button>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Historial de Ausencias del Funcionario</h3>
                        <div className="space-y-2">
                            {loadingAusencias && <p>Cargando...</p>}
                            {!loadingAusencias && ausencias.length > 0 ? ausencias.map(ausencia => (
                            <div key={ausencia.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                                <div>
                                    <p><span className="font-bold capitalize">{ausencia.motivo.replace(/_/g, ' ')}:</span> {new Date(ausencia.fechaInicio).toLocaleDateString()} al {new Date(ausencia.fechaFin).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-400">{ausencia.notas}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {ausencia.certificadoUrl && (
                                        <a href={`http://200.58.121.205:3523${ausencia.certificadoUrl}`} target="_blank" rel="noopener noreferrer" className="inline-block">
                                            <Button size="sm" variant="outline" className="text-gray-900 dark:text-white"><Eye size={14} className="mr-1"/> Ver</Button>
                                        </a>
                                    )}
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveAusencia(ausencia.id)}><Trash2 size={14}/></Button>
                                </div>
                            </div>
                            )) : <p className="text-sm text-gray-400">Este funcionario no tiene ausencias registradas.</p>}
                        </div>
                    </div>
                </>
                )}
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Reporte de Horas Trabajadas</h2>
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1">Funcionario</label>
                        <Select onValueChange={setSelectedReporteUserId} value={selectedReporteUserId}>
                            <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los Funcionarios</SelectItem>
                                {funcionarios.map(f => <SelectItem key={f.id} value={f.id}>{f.nombre || f.email}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1">Desde</label>
                        <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1">Hasta</label>
                        <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                    </div>
                    <Button onClick={handleSearchReporte} disabled={loadingReporte || !selectedReporteUserId} className="w-full md:w-auto">
                        {loadingReporte ? 'Buscando...' : 'Generar Reporte'}
                    </Button>
                </div>
                
                <div className="space-y-8">
                    {loadingReporte && <p className="text-center text-gray-400">Cargando reporte...</p>}
                    {!loadingReporte && reporteProcesado.length > 0 && reporteProcesado.map((data: any) => (
                        <div key={data.usuario.id} className="p-4 bg-gray-900/50 rounded-lg">
                            <h3 className="text-xl font-semibold text-indigo-400 mb-2">{data.usuario.nombre}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Turnos (Entrada - Salida)</th>
                                            <th className="p-3">Horas del Día</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.reporte.map((dia: any) => (
                                            <tr key={dia.fecha} className="border-t border-gray-700">
                                                <td className="p-3">{dia.fecha}</td>
                                                <td className="p-3">{dia.turnos.map((t: any) => `${t.entrada} - ${t.salida}`).join(', ')}</td>
                                                <td className="p-3 font-semibold">{formatHoras(dia.horasDia)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-right mt-2 font-bold">
                                Total Funcionario: 
                                <span className="ml-2 font-mono text-lg text-indigo-400">
                                    {formatHoras(data.reporte.reduce((acc: number, dia: any) => acc + dia.horasDia, 0))}
                                </span>
                            </p>
                        </div>
                    ))}
                    {!loadingReporte && fichajesReporte.length === 0 && (
                        <p className="text-center text-gray-500">No hay datos para generar el reporte con los filtros seleccionados.</p>
                    )}
                </div>

                {reporteProcesado.length > 0 && (
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleExportPDF}>
                            <FileDown size={16} className="mr-2"/> Exportar a PDF
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}