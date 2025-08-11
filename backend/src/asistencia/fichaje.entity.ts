import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/v1/usuario.entity';

export enum TipoFichaje {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
}

@Entity('fichajes')
export class Fichaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { eager: true })
  usuario: Usuario;

  @Column({ type: 'enum', enum: TipoFichaje })
  tipo: TipoFichaje;
  
  // ¡AQUÍ ESTÁ LA CORRECCIÓN!
  @CreateDateColumn() 
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  notas?: string;
}