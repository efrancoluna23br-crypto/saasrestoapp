import { Controller, Post, Body, UseGuards, Req, Param, Get, Patch, HttpCode, HttpStatus, Delete } from '@nestjs/common'; // <-- 'Delete' AÑADIDO
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { AddItemDto } from './dto/add-item.dto';
import { CreatePedidoFuncionarioDto } from './dto/create-pedido-funcionario.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../usuarios/v1/usuario.entity';

@Controller('pedidos/v1')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Patch(':id/transferir')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO, RolUsuario.MOZO)
  transferirMesa(@Param('id') pedidoId: string, @Body() body: { nuevaMesaId: string }) {
    return this.pedidosService.transferirMesa(pedidoId, body.nuevaMesaId);
  }

  @Post()
  @Roles(RolUsuario.MOZO, RolUsuario.ADMIN)
  create(@Body() createPedidoDto: CreatePedidoDto, @Req() req) {
    return this.pedidosService.create(createPedidoDto, req.user);
  }

  @Post('funcionarios')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  createPedidoFuncionario(@Req() req, @Body() dto: CreatePedidoFuncionarioDto) {
    return this.pedidosService.createPedidoFuncionario(req.user, dto);
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  findAllAbiertos() {
    return this.pedidosService.findAllAbiertos();
  }
  
  @Get('mesa/:mesaId/activo')
  @Roles(RolUsuario.MOZO, RolUsuario.ADMIN, RolUsuario.CAJERO)
  findActiveForMesa(@Param('mesaId') mesaId: string) {
    return this.pedidosService.findActiveForMesa(mesaId);
  }

  @Get(':id')
  @Roles(RolUsuario.MOZO, RolUsuario.ADMIN, RolUsuario.CAJERO)
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Post(':id/items')
  @Roles(RolUsuario.MOZO, RolUsuario.ADMIN)
  addItem(@Param('id') pedidoId: string, @Body() addItemDto: AddItemDto) {
    return this.pedidosService.addItem(pedidoId, addItemDto);
  }

  // --- ENDPOINT DE ELIMINAR ÍTEM CORREGIDO ---
  @Delete('items/:itemId')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  @HttpCode(HttpStatus.OK)
  removeItem(@Param('itemId') itemId: string, @Body() body: { motivo: string }, @Req() req) {
    return this.pedidosService.removeItem(itemId, body.motivo, req.user);
  }

  @Post(':id/enviar')
  @Roles(RolUsuario.MOZO, RolUsuario.ADMIN)
  enviarPedido(@Param('id') pedidoId: string) {
    return this.pedidosService.enviarPedido(pedidoId);
  }

  @Patch(':id/cerrar')
  @HttpCode(HttpStatus.OK)
  @Roles(RolUsuario.CAJERO, RolUsuario.ADMIN)
  cerrarPedido(@Param('id') pedidoId: string, @Body() body: { metodoDePago: string }) {
    return this.pedidosService.cerrarPedido(pedidoId, body.metodoDePago);
  }

  @Patch('items/:itemId/cantidad')
  @Roles(RolUsuario.ADMIN, RolUsuario.MOZO, RolUsuario.CAJERO)
  updateItemCantidad(@Param('itemId') itemId: string, @Body() body: { cantidad: number }, @Req() req) {
    return this.pedidosService.updateItemCantidad(itemId, body.cantidad, req.user);
  }

}