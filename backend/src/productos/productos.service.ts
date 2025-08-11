import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { Categoria } from './categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) {}

  async createProducto(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { categoriaId, ...productoData } = createProductoDto;
    const categoria = await this.categoriasRepository.findOneBy({ id: categoriaId });
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID "${categoriaId}" no encontrada`);
    }
    const nuevoProducto = this.productosRepository.create({
      ...productoData,
      categoria,
    });
    return this.productosRepository.save(nuevoProducto);
  }

  async findOneProducto(id: string): Promise<Producto> {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
    }
    return producto;
  }

  async updateProducto(id: string, updateProductoDto: any): Promise<Producto> {
    // Usamos 'preload' para obtener el producto y fusionar los nuevos datos.
    // Luego 'save' lo actualiza. TypeORM es mágico.
    const producto = await this.productosRepository.preload({
      id,
      ...updateProductoDto,
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
    }
    return this.productosRepository.save(producto);
  }

  async removeProducto(id: string): Promise<void> {
    const result = await this.productosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
    }
    // No devolvemos nada, solo confirmamos que se borró.
  }


  findAllProductos(): Promise<Producto[]> {
    return this.productosRepository.find();
  }

  createCategoria(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.categoriasRepository.create(createCategoriaDto);
    return this.categoriasRepository.save(nuevaCategoria);
  }

  findAllCategorias(): Promise<Categoria[]> {
    // Añadimos la relación para que traiga los productos de cada categoría
    return this.categoriasRepository.find({ relations: ['productos'] });
  }
}