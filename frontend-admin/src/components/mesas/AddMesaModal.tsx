"use client";

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from 'lucide-react';

// Definimos una prop para que el componente padre sepa cuándo se ha creado una mesa
interface AddMesaModalProps {
  onMesaAdded: () => void;
}

export function AddMesaModal({ onMesaAdded }: AddMesaModalProps) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [numero, setNumero] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [sector, setSector] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!numero) {
      setError('El número de mesa es obligatorio.');
      return;
    }

    try {
      const response = await fetch('http://200.58.121.205:3523/mesas/v1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: parseInt(numero),
          capacidad: capacidad ? parseInt(capacidad) : undefined,
          sector: sector || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la mesa.');
      }
      
      onMesaAdded(); // Avisamos al componente padre que se actualice
      setIsOpen(false); // Cerramos el modal
      // Limpiamos el formulario
      setNumero('');
      setCapacidad('');
      setSector('');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Mesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Mesa</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="numero" className="text-right">Número</Label>
            <Input id="numero" type="number" value={numero} onChange={(e) => setNumero(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacidad" className="text-right">Capacidad</Label>
            <Input id="capacidad" type="number" placeholder="Ej: 4" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sector" className="text-right">Sector</Label>
            <Input id="sector" placeholder="Ej: Salón Principal" value={sector} onChange={(e) => setSector(e.target.value)} className="col-span-3" />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button onClick={handleSubmit}>Guardar Mesa</Button>
      </DialogContent>
    </Dialog>
  );
}