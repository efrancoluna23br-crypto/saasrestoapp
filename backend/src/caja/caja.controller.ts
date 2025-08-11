import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../usuarios/v1/usuario.entity';

@Controller('caja/v1')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('gastos')
  @Roles(RolUsuario.CAJERO, RolUsuario.ADMIN)
  registrarGasto(@Body() createGastoDto: CreateGastoDto, @Req() req) {
    return this.cajaService.registrarGasto(createGastoDto, req.user);
  }
}