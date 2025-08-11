import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/v1/usuario.entity';

// Opción A: La lista estructurada para estadísticas
export enum MotivoAusencia {
  ENFERMEDAD = 'enfermedad',
  VACACIONES = 'vacaciones',
  ASUNTO_PERSONAL = 'asunto_personal',
  FALTA_JUSTIFICADA = 'falta_justificada',
  FALTA_INJUSTIFICADA = 'falta_injustificada',
  OTRO = 'otro',
}

@Entity('ausencias')
export class Ausencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { eager: true }) // eager: true para que siempre traiga los datos del usuario
  usuario: Usuario;

  @Column({ type: 'enum', enum: MotivoAusencia })
  motivo: MotivoAusencia;

  // Opción B: El campo de texto para detalles
  @Column({ type: 'text', nullable: true })
  notas?: string;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  // ¡La nueva funcionalidad de adjuntos! Guardamos la ruta al archivo.
  @Column({ nullable: true })
  certificadoUrl?: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}