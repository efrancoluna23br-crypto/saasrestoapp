"use client";

import { useState, useEffect, useCallback, useMemo } from 'react'; // <-- useMemo RESTAURADO
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Trash2, Send, ChefHat, GlassWater } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { TransferirPedidoModal } from '@/components/pedidos/TransferirPedidoModal'; // <-- IMPORTAR NUEVO MODAL
import { ArrowRightLeft } from 'lucide-react'; // <-- IMPORTAR NUEVO ICONO


// --- INTERFACES ---
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: { id: string, nombre: string };
}
interface PedidoItem {
  id: string;
  cantidad: number;
  notas?: string;
  precio_unitario: number;
  producto: Producto;
  estado: 'nuevo' | 'enviado' | 'listo' | 'entregado';
}
interface Pedido {
  id: string;
  mesa?: { numero: number };
  mozo: { nombre: string, email: string };
  items: PedidoItem[];
  total: number;
  identificador_custom?: string;
}
interface Categoria {
  id: string;
  nombre: string;
  productos: Producto[];
}
interface Status { 
    message: string; 
    type: 'success' | 'error' | ''; 
}

// --- COMPONENTE PRINCIPAL ---
export default function PedidoPage() {
    const params = useParams();
    const { token, user } = useAuth();
    const router = useRouter();
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<Status>({ message: '', type: '' });

    const pedidoId = Array.isArray(params.pedidoId) ? params.pedidoId[0] : params.pedidoId;
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token || !pedidoId) {
            if(!token) setLoading(false);
            return;
        }
        
        setError('');
        try {
            const [resPedido, resCategorias] = await Promise.all([
                fetch(`http://200.58.121.205:3523/pedidos/v1/${pedidoId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://200.58.121.205:3523/productos/v1/categorias', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!resPedido.ok) {
                const errorData = await resPedido.json().catch(() => ({ message: `Pedido ${pedidoId} no encontrado o ya cerrado.` }));
                throw new Error(errorData.message);
            }
            if (!resCategorias.ok) {
                const errorData = await resCategorias.json().catch(() => ({ message: 'Error al cargar el menú.' }));
                throw new Error(errorData.message);
            }
            
            setPedido(await resPedido.json());
            setCategorias(await resCategorias.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, pedidoId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
  
    const handleAddItem = async (productoId: string) => {
        try {
            const response = await fetch(`http://200.58.121.205:3523/pedidos/v1/${pedidoId}/items`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productoId, cantidad: 1 }),
            });
            if (!response.ok) throw new Error('Error al añadir el producto.');
            await fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateCantidad = async (itemId: string, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) {
            return; 
        }
        try {
            const response = await fetch(`http://200.58.121.205:3523/pedidos/v1/items/${itemId}/cantidad`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: nuevaCantidad }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar la cantidad.');
            }
            await fetchData();
        } catch (err: any) {
            setStatus({ message: err.message, type: 'error' });
            setTimeout(() => setStatus({ message: '', type: '' }), 4000);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (user?.rol !== 'admin' && user?.rol !== 'cajero') {
            alert("No tienes permiso para eliminar ítems.");
            return;
        }
        const motivo = prompt("Por favor, introduce el motivo de la eliminación (requerido por auditoría):");
        if (!motivo) return;
        try {
            const response = await fetch(`http://200.58.121.205:3523/pedidos/v1/items/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo }),
            });
            if (!response.ok) throw new Error('Error al eliminar el ítem.');
            await fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };
  
    const handleSendPedido = async () => {
        if(!confirm('¿Estás seguro de que quieres enviar los ítems nuevos a cocina y barra?')) return;
        try {
            const response = await fetch(`http://200.58.121.205:3523/pedidos/v1/${pedidoId}/enviar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al enviar el pedido.');
            alert('¡Pedido enviado con éxito!');
            await fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const hayItemsNuevos = useMemo(() => pedido?.items.some(item => item.estado === 'nuevo'), [pedido]);

    if (loading) return <p className="text-center p-8 text-xl">Cargando Pedido...</p>;
    if (error) return <p className="text-center text-red-500 p-8">Error: {error}</p>;
    if (!pedido) return <p className="text-center p-8">Pedido no encontrado.</p>;

    // --- RETURN RESTAURADO Y COMPLETO ---
      return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Columna Izquierda: Pedido Actual */}
      <div className="md:w-2/5 lg:w-1/3 bg-gray-800 rounded-lg p-6 flex flex-col shadow-lg">
        {/* --- CABECERA CON NUEVO BOTÓN DE TRANSFERIR --- */}
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold mb-1">Pedido: {pedido.mesa?.numero ? `Mesa ${pedido.mesa.numero}` : pedido.identificador_custom}</h2>
                <p className="text-sm text-gray-400">Atendido por: {pedido.mozo?.nombre || pedido.mozo?.email || 'No asignado'}</p>
            </div>
            {pedido.mesa && ( // Solo mostrar el botón si el pedido está en una mesa
                <Button 
    variant="outline" 
    size="sm" 
    onClick={() => setIsTransferModalOpen(true)}
    className="text-gray-900 dark:text-white"
>
    <ArrowRightLeft size={14} className="mr-2"/> Transferir
</Button>
            )}
        </div>
        
        {/* --- LISTA DE ÍTEMS --- */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {pedido.items.length === 0 && <p className="text-gray-500 text-center mt-10">Añade productos del menú.</p>}
          {pedido.items.map((item) => (
            <div key={item.id} className="p-3 bg-gray-700 rounded-md flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.estado === 'nuevo' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} title={item.estado === 'nuevo' ? 'Pendiente de enviar' : 'Ya enviado'}></div>
              <div className="flex-1">
                <p className="font-semibold">{item.producto.nombre}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400 text-sm">${item.precio_unitario} x {item.cantidad} = ${(Number(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateCantidad(item.id, item.cantidad - 1)}>
                      <MinusCircle className="h-4 w-4"/>
                    </Button>
                    <span className="w-6 text-center font-bold">{item.cantidad}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateCantidad(item.id, item.cantidad + 1)}>
                      <PlusCircle className="h-4 w-4"/>
                    </Button>
                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* --- TOTAL Y BOTONES DE ACCIÓN --- */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <p className="text-3xl font-bold flex justify-between">Total: <span>${Number(pedido.total).toFixed(2)}</span></p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button onClick={() => router.push('/dashboard/caja')} className="bg-green-600 hover:bg-green-700" size="lg">
              Ir a Cobrar
            </Button>
            <Button onClick={handleSendPedido} disabled={!hayItemsNuevos} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed" size="lg">
              <Send className="mr-2"/> 
              {hayItemsNuevos ? 'Enviar Ítems' : 'Todo Enviado'}
            </Button>
          </div>
        </div>
      </div>

      {/* --- Columna Derecha: Menú (sin cambios) --- */}
      <div className="md:w-3/5 lg:w-2/3 bg-gray-800 rounded-lg p-6 overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Menú</h2>
        <div className="space-y-6">
          {categorias.map((cat) => (
            <div key={cat.id}>
              <h3 className="text-xl font-semibold text-indigo-400 mb-3 flex items-center">
                {cat.nombre.toLowerCase().includes('bebida') ? <GlassWater className="mr-2"/> : <ChefHat className="mr-2"/>}
                {cat.nombre}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {cat.productos.map((prod) => (
                  <Button key={prod.id} onClick={() => handleAddItem(prod.id)} variant="outline" className="h-auto flex flex-col items-start p-3 text-left justify-between w-full text-gray-900 dark:text-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                    <p className="font-semibold whitespace-normal break-words w-full">{prod.nombre}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 font-bold">${Number(prod.precio).toFixed(2)}</p>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RENDERIZADO DEL NUEVO MODAL DE TRANSFERENCIA --- */}
      <TransferirPedidoModal
        pedidoId={pedidoId}
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferred={() => {
            setIsTransferModalOpen(false);
            router.push('/dashboard/mesas');
        }}
      />
    </div>
  );
}