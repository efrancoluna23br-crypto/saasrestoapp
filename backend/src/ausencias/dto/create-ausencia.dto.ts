import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { MotivoAusencia } from '../ausencia.entity';

export class CreateAusenciaDto {
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsEnum(MotivoAusencia)
  @IsNotEmpty()
  motivo: MotivoAusencia;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  @IsString()
  @IsOptional()
  notas?: string;
}