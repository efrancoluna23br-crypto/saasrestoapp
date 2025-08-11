import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer'; // <-- Importa Exclude

export enum RolUsuario {
  ADMIN = 'admin',
  CAJERO = 'cajero',
  MOZO = 'mozo',
  COCINA = 'cocina',
}

@Entity('usuarios') // Este es el nombre de la tabla en la base de datos
export class Usuario {
  @PrimaryGeneratedColumn('uuid') // Genera un ID único universal (más seguro que un número)
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true }) // El email debe ser único
  email: string;

  @Column({ type: 'varchar' })
  @Exclude({ toPlainOnly: true })
  password_hash: string; // NUNCA guardamos la contraseña en texto plano

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ type: 'date', nullable: true })
  fecha_contratacion?: Date;
  
  @Column({ type: 'text', nullable: true })
  notas_desempeno?: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.MOZO, // Rol por defecto al crear un usuario
  })
  rol: RolUsuario;
  
  @Column({ type: 'varchar', length: 50, nullable: true }) // Puede ser null si no aplica
  sector?: string; 

  @CreateDateColumn() // TypeORM se encarga de poner la fecha de creación
  fecha_creacion: Date;

  @UpdateDateColumn() // TypeORM se encarga de actualizar esta fecha en cada cambio
  fecha_actualizacion: Date;
}
