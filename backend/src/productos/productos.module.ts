import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosController } from './productos.controller'; // SIN v1
import { ProductosService } from './productos.service';       // SIN v1
import { Producto } from './producto.entity';                 // SIN v1
import { Categoria } from './categoria.entity';               // SIN v1

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}