import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../productos/producto.entity';

export enum EstadoPedidoItem {
  NUEVO = 'nuevo',
  ENVIADO = 'enviado',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
}

@Entity('pedido_items')
export class PedidoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.items)
  pedido: Pedido;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;

  @Column({
    type: 'enum',
    enum: EstadoPedidoItem,
    default: EstadoPedidoItem.NUEVO,
  })
  estado: EstadoPedidoItem;

  @Column({ type: 'text', nullable: true })
  notas?: string;
}