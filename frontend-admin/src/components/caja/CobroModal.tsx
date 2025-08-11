"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interfaces
interface PedidoItem {
    id: string;
    cantidad: number;
    precio_unitario: number;
    producto: { nombre: string };
}
interface Pedido {
    id: string;
    total: number;
    mesa?: { numero: number };
    identificador_custom?: string;
    items: PedidoItem[];
}
interface CobroModalProps {
  pedido: Pedido;
  isOpen: boolean;
  onClose: () => void;
  onPedidoCerrado: () => void;
}

export function CobroModal({ pedido, isOpen, onClose, onPedidoCerrado }: CobroModalProps) {
  const { token } = useAuth();
  const [metodoDePago, setMetodoDePago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<number | string>('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (pedido) {
      setMontoRecibido(Number(pedido.total).toFixed(2));
      setMetodoDePago('efectivo'); // Resetea el método de pago por defecto
      setError('');
    }
  }, [pedido]);

  const handleCerrarPedido = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const response = await fetch(`http://200.58.121.205:3523/pedidos/v1/${pedido.id}/cerrar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodoDePago }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cerrar el pedido.");
      
      alert("¡Pedido cerrado y pagado con éxito!");
      onPedidoCerrado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const vuelto = Number(montoRecibido) - Number(pedido?.total || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* --- ESTILOS DEL MODAL MEJORADOS --- */}
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Cobrar Pedido - {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : pedido.identificador_custom}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Revisa el consumo y selecciona el método de pago.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-900 rounded-md border border-gray-700">
            {pedido?.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-300">
                <span>{item.cantidad}x {item.producto.nombre}</span>
                <span className="font-mono">${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-2xl font-bold flex justify-between border-t border-gray-700 pt-3">Total a Pagar: <span className="text-indigo-400 font-mono">${Number(pedido?.total).toFixed(2)}</span></p>

          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <div className="grid grid-cols-3 gap-2">
    <Button 
        variant={metodoDePago === 'efectivo' ? 'secondary' : 'outline'} 
        onClick={() => setMetodoDePago('efectivo')}
        // --- ¡LA CORRECCIÓN DEFINITIVA! ---
        className={metodoDePago !== 'efectivo' ? '!text-black' : ''}
    >
        Efectivo
    </Button>
    <Button 
        variant={metodoDePago === 'tarjeta' ? 'secondary' : 'outline'} 
        onClick={() => setMetodoDePago('tarjeta')}
        className={metodoDePago !== 'tarjeta' ? '!text-black' : ''}
    >
        Tarjeta
    </Button>
    <Button 
        variant={metodoDePago === 'transferencia' ? 'secondary' : 'outline'} 
        onClick={() => setMetodoDePago('transferencia')}
        className={metodoDePago !== 'transferencia' ? '!text-black' : ''}
    >
        Otro
    </Button>
</div>
          </div>
          
          {metodoDePago === 'efectivo' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="montoRecibido">El cliente paga con:</Label>
              <Input id="montoRecibido" type="number" value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} placeholder="Monto exacto o superior" className="bg-gray-700 border-gray-600"/>
              {Number(montoRecibido) >= Number(pedido.total) && (
                <p className="text-lg font-bold text-green-400">
                  Vuelto: ${vuelto.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}
        <DialogFooter>
          <Button onClick={handleCerrarPedido} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
            {isProcessing ? 'Procesando...' : 'Confirmar Pago y Cerrar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}