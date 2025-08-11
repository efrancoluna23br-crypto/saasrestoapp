"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Mesa { id: string; numero: number; }
interface TransferirPedidoModalProps {
  pedidoId: string;
  isOpen: boolean;
  onClose: () => void;
  onTransferred: () => void;
}

export function TransferirPedidoModal({ pedidoId, isOpen, onClose, onTransferred }: TransferirPedidoModalProps) {
  const { token } = useAuth();
  const [mesasLibres, setMesasLibres] = useState<Mesa[]>([]);
  const [selectedMesaId, setSelectedMesaId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      const fetchMesasLibres = async () => {
        try {
          const response = await fetch('http://200.58.121.205:3523/mesas/v1/estado/libre', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('No se pudieron cargar las mesas libres.');
          setMesasLibres(await response.json());
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchMesasLibres();
    }
  }, [isOpen, token]);

  const handleTransferir = async () => {
    if (!selectedMesaId) {
      setError('Debes seleccionar una mesa de destino.');
      return;
    }
    setError('');
    try {
      const response = await fetch(`http://200.58.121.205:3523/pedidos/v1/${pedidoId}/transferir`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaMesaId: selectedMesaId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al transferir el pedido.");
      
      alert('¡Pedido transferido con éxito!');
      onTransferred();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader><DialogTitle>Transferir Pedido a otra Mesa</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <Select onValueChange={setSelectedMesaId}>
            <SelectTrigger><SelectValue placeholder="Selecciona una mesa libre..." /></SelectTrigger>
            <SelectContent>
              {mesasLibres.map(mesa => <SelectItem key={mesa.id} value={mesa.id}>Mesa {mesa.numero}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <DialogFooter>
          <Button onClick={handleTransferir}>Confirmar Transferencia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}