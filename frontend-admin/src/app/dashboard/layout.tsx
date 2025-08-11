"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-10"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR CORREGIDA --- */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0
        w-64 bg-gray-800 p-4 flex flex-col
        transition-transform duration-300 ease-in-out z-20
      `}>
        {/* ... (el resto del contenido del sidebar se queda igual) ... */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">RestoApp</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X className="h-6 w-6"/>
          </button>
        </div>
        <nav className="flex-1">
          <ul>
            <li className="mb-4"><Link href="/dashboard" className="block py-2 px-4 rounded-md hover:bg-gray-700 hover:text-indigo-400">Inicio</Link></li>
            <li className="mb-4"><Link href="/dashboard/mesas" className="block py-2 px-4 rounded-md hover:bg-gray-700 hover:text-indigo-400">Control de Mesas</Link></li>
            <li className="mb-4"><Link href="/dashboard/productos" className="block py-2 px-4 rounded-md hover:bg-gray-700 hover:text-indigo-400">Gestionar Menú</Link></li>
            <li className="mb-4"><Link href="/dashboard/funcionarios" className="block py-2 px-4 rounded-md hover:bg-gray-700 hover:text-indigo-400">Funcionarios</Link></li>
            <li className="mb-4"><Link href="/dashboard/asistencia" className="block py-2 px-4 rounded-md hover:bg-gray-700 hover:text-indigo-400">Control de Asistencia</Link></li>
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={logout} className="w-full text-left py-2 px-4 rounded-md bg-red-600 hover:bg-red-700">Cerrar Sesión</button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header para móviles */}
        <header className="md:hidden bg-gray-800 p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6"/>
          </button>
          <h1 className="text-xl font-bold">RestoApp</h1>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}