"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../app/contexts/AuthContext';
import { AddFuncionarioModal } from '../../../components/funcionarios/AddFuncionarioModal';
import { EditFuncionarioModal } from '../../../components/funcionarios/EditFuncionarioModal';
import { DeleteFuncionarioButton } from '../../../components/funcionarios/DeleteFuncionarioButton';
import { Button } from '@/components/ui/button'; // Usaremos el alias aquí, debería funcionar. Si no, cambiamos a ruta relativa.

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  fecha_contratacion?: string;
}

const ITEMS_POR_PAGINA = 5;

export default function FuncionariosPage() {
  const { token } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const fetchFuncionarios = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const apiUrl = 'http://200.58.121.205:3523/usuarios/v1';
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('No tienes permiso para ver esta sección o ha ocurrido un error.');
      }
      const data = await response.json();
      setFuncionarios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const totalPaginas = Math.ceil(funcionarios.length / ITEMS_POR_PAGINA);
  const funcionariosPaginados = useMemo(() => {
    const primerIndice = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const ultimoIndice = primerIndice + ITEMS_POR_PAGINA;
    return funcionarios.slice(primerIndice, ultimoIndice);
  }, [funcionarios, paginaActual]);

  const irAPaginaSiguiente = () => {
    setPaginaActual((pag) => Math.min(pag + 1, totalPaginas));
  };

  const irAPaginaAnterior = () => {
    setPaginaActual((pag) => Math.max(pag - 1, 1));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestionar Funcionarios</h1>
        <AddFuncionarioModal onFuncionarioAdded={fetchFuncionarios} />
      </div>

      {loading && <p>Cargando funcionarios...</p>}
      {error && <p className="text-red-500 font-bold">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {funcionariosPaginados.length > 0 ? (
                funcionariosPaginados.map((funcionario) => (
                  <tr key={funcionario.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">{funcionario.nombre}</td>
                    <td className="p-4">{funcionario.email}</td>
                    <td className="p-4 capitalize">{funcionario.rol}</td>
                    <td className="p-4 flex items-center gap-4">
                      <EditFuncionarioModal funcionario={funcionario} onFuncionarioUpdated={fetchFuncionarios} />
                      <DeleteFuncionarioButton funcionarioId={funcionario.id} onFuncionarioDeleted={fetchFuncionarios}/>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">No se encontraron funcionarios.</td></tr>
              )}
            </tbody>
          </table>
          
          {totalPaginas > 1 && (
            <div className="flex items-center justify-end gap-4 p-4 bg-gray-700/50">
              <span className="text-sm text-gray-400">
                Página {paginaActual} de {totalPaginas}
              </span>
              <Button
                onClick={irAPaginaAnterior}
                disabled={paginaActual === 1}
                variant="outline"
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                Anterior
              </Button>
              <Button
                onClick={irAPaginaSiguiente}
                disabled={paginaActual === totalPaginas}
                variant="outline"
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Herramientas de Gestión de Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">Próximamente: Control de Asistencia</div>
          <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">Próximamente: Calendario de Turnos</div>
          <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">Próximamente: Gestión de Ausencias</div>
        </div>
      </div>
    </div>
  );
}