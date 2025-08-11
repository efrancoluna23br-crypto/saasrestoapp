import { IsUUID } from 'class-validator';

export class RegistrarFichajeDto {
  @IsUUID()
  usuarioId: string;
}