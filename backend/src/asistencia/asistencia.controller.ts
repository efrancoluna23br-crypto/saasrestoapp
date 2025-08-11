import { Controller, Post, UseGuards, Body, Get, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AsistenciaService } from './asistencia.service';
import { TipoFichaje } from './fichaje.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../usuarios/v1/usuario.entity';
import { RegistrarFichajeDto } from './dto/registrar-fichaje.dto';

@Controller('asistencia/v1')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Get('registros/hoy')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  getRegistrosDeHoy() {
    return this.asistenciaService.findRegistrosDeHoy();
  }

  @Post('fichar/entrada')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  marcarEntrada(@Body() registrarFichajeDto: RegistrarFichajeDto) {
    return this.asistenciaService.registrarFichaje(registrarFichajeDto.usuarioId, TipoFichaje.ENTRADA);
  }

  @Post('fichar/salida')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  marcarSalida(@Body() registrarFichajeDto: RegistrarFichajeDto) {
    return this.asistenciaService.registrarFichaje(registrarFichajeDto.usuarioId, TipoFichaje.SALIDA);
  }
  
  // --- ¡ENDPOINT CORREGIDO! ---
  // Ahora se llama '/reporte/:usuarioId' y pasa las fechas como strings
  @Get('reporte/:usuarioId')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  getReporteDeAsistencia(
    @Param('usuarioId') usuarioId: string, 
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    // Llama a la función correcta 'findFichajesPorRango'
    return this.asistenciaService.findFichajesPorRango(usuarioId, fechaInicio, fechaFin);
  }
}