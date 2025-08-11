import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../usuarios/v1/usuario.entity';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Controller('productos/v1')
@UseGuards(AuthGuard('jwt'))
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // --- Endpoints de Categorías (PRIMERO, por ser más específicos) ---

  @Get('categorias')
  findAllCategorias() {
    return this.productosService.findAllCategorias();
  }
  
  @Post('categorias')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  createCategoria(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.productosService.createCategoria(createCategoriaDto);
  }

  // --- Endpoints de Productos (DESPUÉS, incluyendo los que tienen :id) ---
  
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  createProducto(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.createProducto(createProductoDto);
  }
  
  @Get()
  findAllProductos() {
    return this.productosService.findAllProductos();
  }

  // ¡Esta ruta ahora se evaluará DESPUÉS de /categorias!
  @Get(':id') 
  findOneProducto(@Param('id') id: string) {
    return this.productosService.findOneProducto(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  updateProducto(@Param('id') id: string, @Body() updateProductoDto: any) {
    return this.productosService.updateProducto(id, updateProductoDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProducto(@Param('id') id: string) {
    return this.productosService.removeProducto(id);
  }
}