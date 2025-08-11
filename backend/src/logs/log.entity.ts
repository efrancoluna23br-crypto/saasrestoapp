import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/v1/usuario.entity';

@Entity('logs_eventos')
export class LogEvento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  tipo_evento: string; // ej: 'ITEM_ANULADO', 'DESCUENTO_APLICADO'

  @ManyToOne(() => Usuario)
  usuario: Usuario; // Quién hizo la acción

  @Column({ type: 'json' })
  metadata: any; // ej: { pedidoId: '...', itemId: '...', motivo: '...' }
}