import { IsInt, IsNotEmpty, IsPositive, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateMesaDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  numero: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  capacidad?: number;

  @IsString()
  @IsOptional()
  sector?: string;
}