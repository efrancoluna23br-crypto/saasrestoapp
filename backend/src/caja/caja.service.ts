import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoCaja, TipoMovimiento } from './movimiento-caja.entity';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { Usuario } from '../usuarios/v1/usuario.entity';

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(MovimientoCaja)
    private movimientosRepository: Repository<MovimientoCaja>,
  ) {}

  registrarGasto(dto: CreateGastoDto, responsable: Usuario): Promise<MovimientoCaja> {
    const nuevoGasto = this.movimientosRepository.create({
      ...dto,
      tipo: TipoMovimiento.GASTO,
      responsable,
    });
    return this.movimientosRepository.save(nuevoGasto);
  }
}