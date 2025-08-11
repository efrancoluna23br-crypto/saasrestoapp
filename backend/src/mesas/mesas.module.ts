import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';
import { Mesa } from './mesa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mesa])],
  controllers: [MesasController],
  providers: [MesasService],
  exports: [MesasService]
})
export class MesasModule {}