"use client";

import { useState } from "react";
// RUTAS CORREGIDAS
import { useAuth } from '../../app/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export function DeleteProductoButton({ productoId, onProductoDeleted }: { productoId: string, onProductoDeleted: () => void }) {
  const { token } = useAuth();
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    try {
      const apiUrl = `http://200.58.121.205:3523/productos/v1/${productoId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }
      onProductoDeleted();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-red-400 hover:text-red-300">Eliminar</button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El producto será eliminado permanentemente del menú.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-gray-500 hover:bg-gray-700 text-white">
  Cancelar
</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </AlertDialogContent>
    </AlertDialog>
  );
}