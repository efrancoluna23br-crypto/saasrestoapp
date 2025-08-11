"use client";

import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth(); // <-- Usa el hook para obtener la función de login
  const [email, setEmail] = useState('admin.bonito@restoapp.com');
  const [password, setPassword] = useState('miClaveDePrueba123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = 'http://200.58.121.205:3523/auth/v1/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      
      // ¡Aquí está el cambio! Llamamos a la función del contexto
      login(data.access_token);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  // El JSX del formulario se queda igual que antes...
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">RestoApp</h1>
        <h2 className="text-xl text-center text-gray-400">Panel de Administración</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (el resto del formulario es idéntico) ... */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Iniciar Sesión
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-300">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}