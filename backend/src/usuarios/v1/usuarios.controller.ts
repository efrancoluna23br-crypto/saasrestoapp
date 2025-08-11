import { Controller, Post, Body, Get, UseGuards, Req, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolUsuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios/v1')
@UseGuards(AuthGuard('jwt')) // Protegemos todo el controlador con autenticación
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // POST /usuarios/v1 - Crear un nuevo usuario (solo Admins)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  crear(@Body() body: any) {
    return this.usuariosService.crearUsuario(body);
  }
  
  // GET /usuarios/v1 - Obtener lista de todos los usuarios (solo Admins)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  findAll() {
    return this.usuariosService.findAll();
  }

  // GET /usuarios/v1/perfil - Obtener el perfil del usuario logueado actualmente
  @Get('perfil')
  getProfile(@Req() req) {
    // El 'user' viene del token validado por el AuthGuard
    // Usamos el servicio para obtener los datos completos y actualizados de la BD
    return this.usuariosService.findOne(req.user.userId);
  }

  // GET /usuarios/v1/:id - Obtener un usuario específico por ID (solo Admins)
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  // PATCH /usuarios/v1/:id - Actualizar un usuario (solo Admins)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  update(@Param('id') id: string, @Body() updateUsuarioDto: any) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  // DELETE /usuarios/v1/:id - Eliminar un usuario (solo Admins)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}