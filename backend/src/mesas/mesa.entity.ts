import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EstadoMesa {
  LIBRE = 'libre',
  OCUPADA = 'ocupada',
  RESERVADA = 'reservada',
  NECESITA_LIMPIEZA = 'necesita_limpieza',
}

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  numero: number;

  @Column({ type: 'int', default: 4 })
  capacidad: number;

  @Column({ type: 'varchar', length: 100, default: 'Salón Principal' })
  sector: string;

  @Column({
    type: 'enum',
    enum: EstadoMesa,
    default: EstadoMesa.LIBRE,
  })
  estado: EstadoMesa;
  
  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}