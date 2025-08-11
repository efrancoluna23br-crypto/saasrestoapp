import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ausencia } from './ausencia.entity';
import { AusenciasController } from './ausencias.controller'; // <-- IMPORTAR
import { AusenciasService } from './ausencias.service'; // <-- IMPORTAR
import { AuthModule } from 'src/auth/auth.module';
@Module({
imports: [
TypeOrmModule.forFeature([Ausencia]),
AuthModule // Importamos AuthModule para que los Guards funcionen
],
controllers: [AusenciasController], // <-- AÑADIR
providers: [AusenciasService], // <-- AÑADIR
})
export class AusenciasModule {}