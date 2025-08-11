"use client";

import { useState } from "react";
import { useAuth } from '../../app/contexts/AuthContext';
import { Button } from "../ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const rolesDisponibles = ['mozo', 'cajero', 'cocina', 'admin'];

export function AddFuncionarioModal({ onFuncionarioAdded }: { onFuncionarioAdded: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaContratacion, setFechaContratacion] = useState("");

  const [error, setError] = useState("");

  const resetForm = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setRol("");
    setTelefono("");
    setFechaContratacion("");
    setError("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!rol) {
      setError("Debes seleccionar un rol.");
      return;
    }

    try {
      const apiUrl = 'http://200.58.121.205:3523/usuarios/v1';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          nombre, 
          email, 
          password, 
          rol, 
          telefono, 
          fecha_contratacion: fechaContratacion || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear el funcionario");
      }

      setOpen(false);
      onFuncionarioAdded();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Añadir Funcionario</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Funcionario</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un nuevo miembro del equipo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">Nombre</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefono" className="text-right">Teléfono</Label>
            <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fecha_contratacion" className="text-right">Fecha Contrat.</Label>
            <Input id="fecha_contratacion" type="date" value={fechaContratacion} onChange={(e) => setFechaContratacion(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rol" className="text-right">Rol</Label>
            <Select onValueChange={setRol} value={rol} required>
              <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {rolesDisponibles.map(r => (
                  <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="col-span-4 text-red-500 text-center">{error}</p>}
          <DialogFooter>
            <Button type="submit">Guardar Funcionario</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}