import Link from 'next/link';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export function DashboardCard({ title, description, href, icon }: DashboardCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="relative h-full bg-gray-800 rounded-lg p-6 border border-gray-700
                      transition-all duration-300 group-hover:border-indigo-500/50">
        {/* Efecto de brillo */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 
                      rounded-lg blur-sm opacity-0 group-hover:opacity-75 transition-all duration-300"></div>
        
        <div className="relative">
          <div className="text-indigo-400 mb-4">{icon}</div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-400">{description}</p>
          
          <div className="flex items-center mt-4 text-sm font-medium text-indigo-400">
  Acceder
  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
</div>
        </div>
      </div>
    </Link>
  );
}