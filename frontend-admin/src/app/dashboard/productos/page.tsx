"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AddProductoModal } from '../../../components/productos/AddProductoModal';
import { DeleteProductoButton } from '../../../components/productos/DeleteProductoButton';
import { EditProductoModal } from '../../../components/productos/EditProductoModal';

// Definimos los tipos para nuestros productos
interface Categoria {
  id: string;
  nombre: string;
}
interface Producto {
  id: string;
  nombre: string;
  precio: string;
  categoria: Categoria;
}

export default function ProductosPage() {
  const { token } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para los filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const fetchProductos = useCallback(async () => {
    if (!token) {
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const apiUrl = 'http://200.58.121.205:3523/productos/v1';
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los productos.');
      }

      const data = await response.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Lógica de filtrado con useMemo para optimización
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      const nombreMatch = producto.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
      const categoriaMatch = producto.categoria.nombre.toLowerCase().includes(filtroCategoria.toLowerCase());
      return nombreMatch && categoriaMatch;
    });
  }, [productos, filtroNombre, filtroCategoria]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gestionar Menú</h1>
        <AddProductoModal onProductoAdded={fetchProductos} />
      </div>

      <div className="flex gap-4 mb-4 p-4 bg-gray-800 rounded-lg">
        <input
          type="text"
          placeholder="Filtrar por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Filtrar por categoría..."
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {loading && <p>Cargando productos...</p>}
      {error && <p className="text-red-500 font-bold">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">{producto.nombre}</td>
                    <td className="p-4">{producto.categoria.nombre}</td>
                    <td className="p-4">${parseFloat(producto.precio).toFixed(2)}</td>
                    <td className="p-4">
                      <EditProductoModal producto={producto} onProductoUpdated={fetchProductos} />
                      <DeleteProductoButton 
                        productoId={producto.id} 
                        onProductoDeleted={fetchProductos} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400">
                    No se encontraron productos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}