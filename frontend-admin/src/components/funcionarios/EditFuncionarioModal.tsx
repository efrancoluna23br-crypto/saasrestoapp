"use client";
import { useState } from "react";
import { useAuth } from '../../app/contexts/AuthContext';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Funcionario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  fecha_contratacion?: string;
}

const rolesDisponibles = ['mozo', 'cajero', 'cocina', 'admin'];

export function EditFuncionarioModal({ funcionario, onFuncionarioUpdated }: { funcionario: Funcionario, onFuncionarioUpdated: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  
  const formatISODate = (dateString?: string) => {
    if (!dateString) return "";
    return dateString.split('T')[0];
  };
  
  const [nombre, setNombre] = useState(funcionario.nombre);
  const [email, setEmail] = useState(funcionario.email);
  const [rol, setRol] = useState(funcionario.rol);
  const [telefono, setTelefono] = useState(funcionario.telefono || "");
  const [fechaContratacion, setFechaContratacion] = useState(formatISODate(funcionario.fecha_contratacion));

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const apiUrl = `http://200.58.121.205:3523/usuarios/v1/${funcionario.id}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          nombre, 
          email, 
          rol,
          telefono,
          fecha_contratacion: fechaContratacion || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar el funcionario");
      }

      setOpen(false);
      onFuncionarioUpdated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Funcionario</DialogTitle>
          <DialogDescription>Modifica los datos del miembro del equipo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`nombre-edit-${funcionario.id}`} className="text-right">Nombre</Label>
            <Input id={`nombre-edit-${funcionario.id}`} value={nombre} onChange={(e) => setNombre(e.target.value)} required className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`email-edit-${funcionario.id}`} className="text-right">Email</Label>
            <Input id={`email-edit-${funcionario.id}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`telefono-edit-${funcionario.id}`} className="text-right">Teléfono</Label>
            <Input id={`telefono-edit-${funcionario.id}`} value={telefono} onChange={(e) => setTelefono(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`fecha_contratacion-edit-${funcionario.id}`} className="text-right">Fecha Contrat.</Label>
            <Input id={`fecha_contratacion-edit-${funcionario.id}`} type="date" value={fechaContratacion} onChange={(e) => setFechaContratacion(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`rol-edit-${funcionario.id}`} className="text-right">Rol</Label>
            <Select onValueChange={setRol} value={rol}>
              <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {rolesDisponibles.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="col-span-4 text-red-500 text-center">{error}</p>}
          <DialogFooter>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}