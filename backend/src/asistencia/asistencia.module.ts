import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { Fichaje } from './fichaje.entity';
import { Usuario } from '../usuarios/v1/usuario.entity'; // Importamos Usuario porque el servicio lo necesita

@Module({
  imports: [
    TypeOrmModule.forFeature([Fichaje, Usuario]) // Le damos acceso a los repositorios de Fichaje y Usuario
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
})
export class AsistenciaModule {}