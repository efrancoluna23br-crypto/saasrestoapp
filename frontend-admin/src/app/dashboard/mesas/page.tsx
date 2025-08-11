"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { AddMesaModal } from '@/components/mesas/AddMesaModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Square, CheckSquare, XSquare, WashingMachine, Utensils, BookMarked, Trash2 } from 'lucide-react';

// --- INTERFACES ---
interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  sector: string;
  estado: 'libre' | 'ocupada' | 'reservada' | 'necesita_limpieza';
}

// --- HELPERS ---
const getMesaStyle = (estado: Mesa['estado']) => {
  switch (estado) {
    case 'libre': return { bg: 'bg-green-800/60 hover:bg-green-700/80', text: 'text-green-300', icon: <CheckSquare className="h-6 w-6 text-green-300" /> };
    case 'ocupada': return { bg: 'bg-red-800/60 hover:bg-red-700/80', text: 'text-red-300', icon: <XSquare className="h-6 w-6 text-red-300" /> };
    case 'reservada': return { bg: 'bg-orange-800/60 hover:bg-orange-700/80', text: 'text-orange-300', icon: <BookMarked className="h-6 w-6 text-orange-300" /> };
    case 'necesita_limpieza': return { bg: 'bg-yellow-800/60 hover:bg-yellow-700/80', text: 'text-yellow-300', icon: <WashingMachine className="h-6 w-6 text-yellow-300" /> };
    default: return { bg: 'bg-gray-700', text: 'text-gray-300', icon: <Square className="h-6 w-6 text-gray-300" /> };
  }
};

// --- COMPONENTE PRINCIPAL ---
export default function MesasPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

  const fetchMesas = useCallback(async () => {
    if (!token) {
        setLoading(false);
        setError("Autenticación no válida. Por favor, vuelve a iniciar sesión.");
        return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://200.58.121.205:3523/mesas/v1', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      setMesas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Se ejecuta solo una vez cuando el token está disponible
    if(token) {
        fetchMesas();
    }
  }, [token, fetchMesas]);

  const mesasPorSector = useMemo(() => {
    return mesas.reduce((acc, mesa) => {
      const sector = mesa.sector || 'Sin Sector';
      if (!acc[sector]) acc[sector] = [];
      acc[sector].push(mesa);
      return acc;
    }, {} as { [key: string]: Mesa[] });
  }, [mesas]);
  
  const handleUpdateEstado = async (nuevoEstado: Mesa['estado']) => {
    if (!selectedMesa) return;
    try {
      const response = await fetch(`http://200.58.121.205:3523/mesas/v1/${selectedMesa.id}/estado`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!response.ok) throw new Error("Error al actualizar el estado de la mesa.");
      await fetchMesas();
      setSelectedMesa(null);
    } catch (err: any) {
      setError(err.message);
      setSelectedMesa(null);
    }
  };
  
  const handlePedidoAction = async () => {
    if (!selectedMesa) return;
    setError('');
    try {
      if (selectedMesa.estado === 'ocupada') {
        const checkResponse = await fetch(`http://200.58.121.205:3523/pedidos/v1/mesa/${selectedMesa.id}/activo`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!checkResponse.ok) throw new Error("No se encontró el pedido activo. Libere la mesa desde Caja.");
        const pedidoActivo = await checkResponse.json();
        router.push(`/dashboard/pedidos/${pedidoActivo.id}`);
      } else {
        const createResponse = await fetch('http://200.58.121.205:3523/pedidos/v1', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ mesaId: selectedMesa.id }),
        });
        const nuevoPedido = await createResponse.json();
        if (!createResponse.ok) throw new Error(nuevoPedido.message || "Error al crear el pedido.");
        router.push(`/dashboard/pedidos/${nuevoPedido.id}`);
      }
    } catch (err: any) {
      setError(err.message);
      setSelectedMesa(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-400 mt-8">Cargando salón...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 font-bold mt-8">Error: {error}</p>;
    }
    if (mesas.length === 0) {
      return <p className="text-center text-gray-500 mt-8">No hay mesas creadas. ¡Añade la primera!</p>;
    }
    return (
      <div className="space-y-12">
        {Object.entries(mesasPorSector).map(([sector, mesasDelSector]) => (
          <div key={sector}>
            <h2 className="text-2xl font-semibold border-b-2 border-indigo-500 pb-2 mb-6">{sector}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {mesasDelSector.map((mesa) => {
                const style = getMesaStyle(mesa.estado);
                return (
                  <div key={mesa.id} onClick={() => setSelectedMesa(mesa)} className={`p-4 rounded-lg shadow-lg flex flex-col items-center justify-center aspect-square cursor-pointer transition-transform hover:scale-105 ${style.bg}`}>
                    {style.icon}
                    <p className="text-4xl font-bold mt-2">{mesa.numero}</p>
                    <div className="flex items-center gap-2 text-gray-300 mt-1"><Users size={16} /><span>{mesa.capacidad}</span></div>
                    <div className="text-xs text-gray-400 mt-2 truncate w-full text-center"><span>{mesa.sector}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Control de Mesas y Salón</h1>
        {user?.rol === 'admin' && <AddMesaModal onMesaAdded={fetchMesas} />}
      </div>
      
      {renderContent()}

      <Dialog open={!!selectedMesa} onOpenChange={() => setSelectedMesa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesa {selectedMesa?.numero} <span className="text-base font-normal text-gray-400">- {selectedMesa?.sector}</span></DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p>Estado actual: <span className={`font-bold capitalize ${selectedMesa ? getMesaStyle(selectedMesa.estado).text : ''}`}>{selectedMesa?.estado?.replace('_', ' ') || ''}</span></p>
            <h3 className="font-semibold pt-4 border-t border-gray-700">Acciones Disponibles</h3>
            <div className="grid grid-cols-2 gap-3">
              {(selectedMesa?.estado === 'libre' || selectedMesa?.estado === 'reservada') && (
                <Button onClick={handlePedidoAction} className="bg-green-600 hover:bg-green-700 col-span-2">
                  <Utensils size={16} className="mr-2"/> Nuevo Pedido
                </Button>
              )}
              {selectedMesa?.estado === 'ocupada' && (
                <Button onClick={handlePedidoAction} className="col-span-2">
                  <Utensils size={16} className="mr-2"/> Ver/Editar Pedido
                </Button>
              )}
              {selectedMesa?.estado === 'libre' && (
                 <Button onClick={() => handleUpdateEstado('reservada')} className="bg-orange-600 hover:bg-orange-700"><BookMarked size={16} className="mr-2"/> Reservar</Button>
              )}
              {selectedMesa?.estado === 'reservada' && (
                 <Button onClick={() => handleUpdateEstado('libre')} variant="outline"><Trash2 size={16} className="mr-2"/> Cancelar Reserva</Button>
              )}
              {selectedMesa?.estado === 'ocupada' && (
                 <Button onClick={() => handleUpdateEstado('necesita_limpieza')} className="bg-yellow-600 hover:bg-yellow-700"><WashingMachine size={16} className="mr-2"/> Liberar y Limpiar</Button>
              )}
              {selectedMesa?.estado === 'necesita_limpieza' && (
                 <Button onClick={() => handleUpdateEstado('libre')} className="bg-green-600 hover:bg-green-700 w-full col-span-2"><CheckSquare size={16} className="mr-2"/> Marcar como Libre</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}