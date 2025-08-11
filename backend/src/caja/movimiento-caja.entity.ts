import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/v1/usuario.entity';

export enum TipoMovimiento {
  GASTO = 'gasto',
  INGRESO_MANUAL = 'ingreso_manual',
  // Podríamos añadir más tipos en el futuro
}

@Entity('movimientos_caja')
export class MovimientoCaja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo: TipoMovimiento;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'varchar' })
  descripcion: string; // Ej: "Compra de tomates", "Fondo de caja inicial"

  @ManyToOne(() => Usuario)
  responsable: Usuario; // El cajero/admin que registró el movimiento

  @CreateDateColumn()
  fecha: Date;
}