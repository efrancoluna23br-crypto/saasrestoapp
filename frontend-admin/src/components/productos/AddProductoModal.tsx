"use client";

import { useState, useEffect } from "react";
import { useAuth } from '../../app/contexts/AuthContext';
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Categoria {
  id: string;
  nombre: string;
}

export function AddProductoModal({ onProductoAdded }: { onProductoAdded: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      console.log('Intentando cargar categorías con token:', token);
      
      if (!token) {
        setError("Token de autenticación no encontrado. Por favor, inicie sesión de nuevo.");
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        const apiUrl = 'http://200.58.121.205:3523/productos/v1/categorias';
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        console.log('Respuesta cruda de categorías:', response);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Cuerpo del error:', errorBody);
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategorias(data);
      } catch (err: any) {
        console.error("Error en el bloque catch:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchCategorias();
    }
  }, [open, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = 'http://200.58.121.205:3523/productos/v1';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          precio: parseFloat(precio),
          categoriaId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear el producto");
      }

      setOpen(false);
      onProductoAdded();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir Producto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa los detalles del nuevo producto para el menú.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">Nombre</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="precio" className="text-right">Precio</Label>
            <Input id="precio" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoria" className="text-right">Categoría</Label>
            <Select onValueChange={setCategoriaId} value={categoriaId}>
              <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {isLoading ? (
                  <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : (
                  categorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="col-span-4 text-red-500 text-center">{error}</p>}
          <DialogFooter>
            <Button type="submit">Guardar Producto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}