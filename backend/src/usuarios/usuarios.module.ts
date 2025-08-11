import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './v1/usuarios.controller';
import { UsuariosService } from './v1/usuarios.service';
import { Usuario } from './v1/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService] // <-- VA DENTRO DEL OBJETO {}, SEPARADO POR COMAS
})
export class UsuariosModule {}
