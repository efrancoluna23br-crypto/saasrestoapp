"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CobroModal } from '@/components/caja/CobroModal'; // Asegúrate de que la ruta es correcta

// --- INTERFACES ---
interface PedidoAbierto {
    id: string;
    total: number;
    mesa?: { numero: number };
    identificador_custom?: string;
    items: any[]; // Necesitamos los items para el resumen en el modal
}

// --- COMPONENTE PRINCIPAL ---
export default function CajaPage() {
    const { token } = useAuth();
    const [pedidosAbiertos, setPedidosAbiertos] = useState<PedidoAbierto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPedido, setSelectedPedido] = useState<PedidoAbierto | null>(null);

    const fetchPedidosAbiertos = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://200.58.121.205:3523/pedidos/v1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("No se pudieron cargar los pedidos abiertos.");
            setPedidosAbiertos(await response.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPedidosAbiertos();
    }, [fetchPedidosAbiertos]);

    if (loading) return <p className="text-center p-8 text-xl">Cargando pedidos abiertos...</p>;
    if (error) return <p className="text-center text-red-500 p-8">Error: {error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Caja - Pedidos Abiertos</h1>
            <div className="space-y-4">
                {pedidosAbiertos.map((pedido) => (
                    <div key={pedido.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center shadow-md">
                        <div>
                            <p className="font-bold text-xl">
                                {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : pedido.identificador_custom || 'Pedido sin identificar'}
                            </p>
                            <p className="text-sm text-gray-400">Total: ${Number(pedido.total).toFixed(2)}</p>
                        </div>
                        <Button onClick={() => setSelectedPedido(pedido)} className="bg-green-600 hover:bg-green-700">
                            Cobrar
                        </Button>
                    </div>
                ))}
                {pedidosAbiertos.length === 0 && (
                    <div className="text-center p-10 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">No hay pedidos abiertos para cobrar en este momento.</p>
                    </div>
                )}
            </div>

            {/* Renderizamos el Modal solo si hay un pedido seleccionado */}
            {selectedPedido && (
                <CobroModal
                    pedido={selectedPedido}
                    isOpen={!!selectedPedido}
                    onClose={() => setSelectedPedido(null)}
                    onPedidoCerrado={() => {
                        fetchPedidosAbiertos(); // Recargamos la lista después de un cobro exitoso
                        setSelectedPedido(null); // Cerramos el modal
                    }}
                />
            )}
        </div>
    );
}