import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsUUID } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsUUID()
  @IsNotEmpty()
  categoriaId: string;
}