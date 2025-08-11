import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comanda } from './comanda.entity';
import { ComandasController } from './comandas.controller';
import { ComandasService } from './comandas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comanda])],
  controllers: [ComandasController],
  providers: [ComandasService],
  exports: [TypeOrmModule]
})
export class ComandasModule {}