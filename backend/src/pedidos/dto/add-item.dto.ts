import { IsUUID, IsNotEmpty, IsInt, IsPositive, IsString, IsOptional } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  @IsNotEmpty()
  productoId: string;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsString()
  @IsOptional()
  notas?: string;
}