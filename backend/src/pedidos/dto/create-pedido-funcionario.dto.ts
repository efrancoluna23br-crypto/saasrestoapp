import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddItemDto } from './add-item.dto'; // Reutilizamos el DTO para añadir ítems

export class CreatePedidoFuncionarioDto {
  // El pedido puede incluir ítems adicionales desde el principio
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddItemDto)
  itemsAdicionales: AddItemDto[];
}