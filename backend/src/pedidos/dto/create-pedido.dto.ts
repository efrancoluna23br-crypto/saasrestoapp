import { IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreatePedidoDto {
  @IsUUID()
  @IsOptional() // Hacemos ambos opcionales...
  mesaId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional() // ...pero la lógica en el servicio se asegurará de que uno venga.
  identificadorCustom?: string;
}