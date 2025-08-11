import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Mesa } from '../mesas/mesa.entity';
import { Usuario } from '../usuarios/v1/usuario.entity';
import { PedidoItem } from './pedido-item.entity';

export enum EstadoPedido {
  ABIERTO = 'abierto',
  CERRADO = 'cerrado',
  CANCELADO = 'cancelado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mesa, { nullable: true })
  mesa?: Mesa;

  @ManyToOne(() => Usuario)
  mozo: Usuario;

  @OneToMany(() => PedidoItem, (item) => item.pedido, { cascade: true, eager: true })
  items: PedidoItem[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  identificador_custom?: string;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.ABIERTO,
  })
  estado: EstadoPedido;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'boolean', default: false })
  es_pedido_funcionario: boolean;

  @CreateDateColumn()
  fecha_apertura: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}