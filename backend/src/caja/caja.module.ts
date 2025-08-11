import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaController } from './caja.controller';
import { CajaService } from './caja.service';
import { MovimientoCaja } from './movimiento-caja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoCaja])],
  controllers: [CajaController],
  providers: [CajaService],
})
export class CajaModule {}