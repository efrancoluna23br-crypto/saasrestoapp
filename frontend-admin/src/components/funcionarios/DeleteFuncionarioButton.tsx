"use client";
import { useState } from "react";
import { useAuth } from '../../app/contexts/AuthContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";

export function DeleteFuncionarioButton({ funcionarioId, onFuncionarioDeleted }: { funcionarioId: string, onFuncionarioDeleted: () => void }) {
  const { token } = useAuth();
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    try {
      // ¡URL correcta para eliminar usuarios!
      const apiUrl = `http://200.58.121.205:3523/usuarios/v1/${funcionarioId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar el funcionario");
      
      onFuncionarioDeleted();
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
          <AlertDialogDescription>Esta acción es permanente. El usuario será eliminado del sistema.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-100 text-gray-900 hover:bg-gray-200">
  Cancelar
</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Sí, eliminar</AlertDialogAction>
        </AlertDialogFooter>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </AlertDialogContent>
    </AlertDialog>
  );
}