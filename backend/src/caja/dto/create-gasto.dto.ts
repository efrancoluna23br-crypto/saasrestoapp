import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateGastoDto {
  @IsNumber()
  @IsPositive()
  monto: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}