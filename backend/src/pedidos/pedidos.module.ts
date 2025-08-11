import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { Pedido } from './pedido.entity';
import { PedidoItem } from './pedido-item.entity';
import { Producto } from '../productos/producto.entity';
import { Mesa } from '../mesas/mesa.entity';
import { ComandasModule } from '../comandas/comandas.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, PedidoItem, Producto, Mesa]),
    ComandasModule,
    NotificationsModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService]
})
export class PedidosModule {}