import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../usuarios/v1/usuario.entity';

@Controller('mesas/v1')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Aplicamos ambos guards a todo el controlador
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @Roles(RolUsuario.ADMIN)
  create(@Body() createMesaDto: CreateMesaDto) {
    return this.mesasService.create(createMesaDto);
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO, RolUsuario.MOZO) // Permitimos a todos ver el salón
  findAll() {
    return this.mesasService.findAll();
  }

  @Get('estado/libre')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO, RolUsuario.MOZO) // Permitimos a todos ver las mesas libres
  findAllLibres() {
    return this.mesasService.findAllLibres();
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO, RolUsuario.MOZO) // Permitimos a todos ver una mesa específica
  findOne(@Param('id') id: string) {
    return this.mesasService.findOne(id);
  }
  
  @Patch(':id/estado')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO, RolUsuario.MOZO)
  updateEstado(@Param('id') id: string, @Body() updateMesaDto: UpdateMesaDto) {
    return this.mesasService.updateEstado(id, updateMesaDto);
  }
}