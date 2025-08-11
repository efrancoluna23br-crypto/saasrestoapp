"use client";

import { useAuth } from '../../app/contexts/AuthContext';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { CajaIcon, FuncionariosIcon, InventarioIcon, ReservasIcon, MesasIcon, MenuIcon } from '../../components/dashboard/DashboardIcons';

export default function DashboardHomePage() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">¡Hola, {user?.nombre || user?.email || 'Admin'}!</h1>
        <p className="text-lg text-gray-400">Selecciona una sección para comenzar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DashboardCard
          title="Control de Mesas"
          description="Visualiza el salón, gestiona pedidos y optimiza el flujo de clientes."
          href="/dashboard/mesas"
          icon={<MesasIcon />}
        />
        <DashboardCard
          title="Gestionar Menú"
          description="Añade, edita y elimina productos y categorías del menú."
          href="/dashboard/productos"
          icon={<MenuIcon />}
        />
        <DashboardCard
          title="Funcionarios"
          description="Gestiona tu equipo, planifica horarios y controla asistencias."
          href="/dashboard/funcionarios"
          icon={<FuncionariosIcon />}
        />
        <DashboardCard
          title="Flujo de Caja"
          description="Revisa las ventas del día, cierres de caja y reportes financieros."
          href="/dashboard/caja"
          icon={<CajaIcon />}
        />
        <DashboardCard
          title="Inventario"
          description="Controla tus insumos, recibe alertas de bajo stock y optimiza compras."
          href="/dashboard/inventario"
          icon={<InventarioIcon />}
        />
        <DashboardCard
          title="Gestión de Reservas"
          description="Administra las reservas de tus clientes y planifica la ocupación."
          href="/dashboard/reservas"
          icon={<ReservasIcon />}
        />
      </div>
    </div>
  );
}