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

// Tipos
interface Categoria { id: string; nombre: string; }
interface Producto { id: string; nombre: string; precio: string; categoria: Categoria; }

export function EditProductoModal({ producto, onProductoUpdated }: { producto: Producto, onProductoUpdated: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Estados inicializados con los datos del producto
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [categoriaId, setCategoriaId] = useState(producto.categoria.id); // <-- Importante

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [error, setError] = useState("");

  // Lógica para cargar las categorías cuando se abre el modal
  useEffect(() => {
    if (open && token) {
      const fetchCategorias = async () => {
        setIsLoadingCat(true);
        try {
          const apiUrl = 'http://200.58.121.205:3523/productos/v1/categorias';
          const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Error al cargar categorías");
          const data = await response.json();
          setCategorias(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoadingCat(false);
        }
      };
      fetchCategorias();
    }
  }, [open, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = `http://200.58.121.205:3523/productos/v1/${producto.id}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          precio: parseFloat(precio),
          categoriaId, // Enviamos el ID de la categoría seleccionada
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar el producto");
      }

      setOpen(false);
      onProductoUpdated();
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
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Modifica los detalles del producto.</DialogDescription>
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
          {/* CAMPO DE CATEGORÍA AÑADIDO */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoria" className="text-right">Categoría</Label>
            <Select onValueChange={setCategoriaId} value={categoriaId}>
              <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {isLoadingCat ? (
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
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}