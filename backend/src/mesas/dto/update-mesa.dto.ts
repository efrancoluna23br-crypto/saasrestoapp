import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoMesa } from '../mesa.entity';

export class UpdateMesaDto {
  @IsEnum(EstadoMesa)
  @IsNotEmpty()
  estado: EstadoMesa;
}