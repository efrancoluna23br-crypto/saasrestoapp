import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinTable, ManyToMany } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';
import { PedidoItem } from '../pedidos/pedido-item.entity';

export enum TipoComanda {
  COCINA = 'cocina',
  BARRA = 'barra',
}

export enum EstadoComanda {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  LISTA = 'lista',
  ENTREGADA = 'entregada',
}

@Entity('comandas')
export class Comanda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido)
  pedido: Pedido;

  @Column({ type: 'enum', enum: TipoComanda })
  tipo: TipoComanda;

  @Column({
    type: 'enum',
    enum: EstadoComanda,
    default: EstadoComanda.PENDIENTE,
  })
  estado: EstadoComanda;

  // Relación Many-to-Many para asociar ítems específicos a esta comanda
  @ManyToMany(() => PedidoItem)
  @JoinTable()
  items: PedidoItem[];

  @CreateDateColumn()
  fecha_creacion: Date;
}