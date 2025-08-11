import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;
}