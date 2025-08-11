import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Pedido, EstadoPedido } from './pedido.entity';
import { PedidoItem, EstadoPedidoItem } from './pedido-item.entity'; // <-- ¡IMPORTACIÓN AÑADIDA!
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { AddItemDto } from './dto/add-item.dto';
import { CreatePedidoFuncionarioDto } from './dto/create-pedido-funcionario.dto';
import { Usuario } from '../usuarios/v1/usuario.entity';
import { Mesa, EstadoMesa } from '../mesas/mesa.entity';
import { Producto } from '../productos/producto.entity';
import { Comanda, TipoComanda } from '../comandas/comanda.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private pedidosRepository: Repository<Pedido>,
    @InjectRepository(PedidoItem) private pedidoItemsRepository: Repository<PedidoItem>,
    @InjectRepository(Mesa) private mesasRepository: Repository<Mesa>,
    @InjectRepository(Producto) private productosRepository: Repository<Producto>,
    @InjectRepository(Comanda) private comandasRepository: Repository<Comanda>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // --- LÓGICA DE GESTIÓN DE PEDIDOS ---
  async create(createPedidoDto: CreatePedidoDto, mozo: Usuario): Promise<Pedido> {
    const { mesaId, identificadorCustom } = createPedidoDto;

    if (!mesaId && !identificadorCustom) {
      throw new BadRequestException('Se debe proporcionar un mesaId o un identificadorCustom.');
    }
    if (mesaId && identificadorCustom) {
      throw new BadRequestException('No se puede especificar mesaId e identificadorCustom al mismo tiempo.');
    }

    if (mesaId) {
      const mesa = await this.mesasRepository.findOneBy({ id: mesaId });
      if (!mesa) throw new NotFoundException(`Mesa con ID "${mesaId}" no encontrada`);
      
      const pedidoActivo = await this.pedidosRepository.findOne({ where: { mesa: { id: mesaId }, estado: EstadoPedido.ABIERTO }});
      if (pedidoActivo) throw new ConflictException(`La mesa ${mesa.numero} ya tiene un pedido abierto.`);

      mesa.estado = EstadoMesa.OCUPADA;
      await this.mesasRepository.save(mesa);

      const nuevoPedido = this.pedidosRepository.create({ mesa, mozo, items: [] });
      return this.pedidosRepository.save(nuevoPedido);
    } else {
      const nuevoPedido = this.pedidosRepository.create({ identificador_custom: identificadorCustom, mozo, items: [] });
      return this.pedidosRepository.save(nuevoPedido);
    }
  }

  async findOne(id: string): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
        where: { id },
        relations: ['mesa', 'mozo', 'items', 'items.producto'],
    });
    if (!pedido) throw new NotFoundException(`Pedido con ID "${id}" no encontrado`);
    return pedido;
  }

  async findActiveForMesa(mesaId: string): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
        where: { mesa: { id: mesaId }, estado: EstadoPedido.ABIERTO },
        relations: ['mesa', 'mozo', 'items', 'items.producto'],
    });
    if (!pedido) throw new NotFoundException(`No se encontró un pedido activo para la mesa con ID "${mesaId}"`);
    return pedido;
  }

  findAllAbiertos(): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { estado: EstadoPedido.ABIERTO },
      relations: ['mesa', 'mozo', 'items', 'items.producto'], // Añadimos items para la vista de caja
      order: { fecha_apertura: 'ASC' },
    });
  }

  // --- LÓGICA DE ÍTEMS DEL PEDIDO ---
  async addItem(pedidoId: string, addItemDto: AddItemDto): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    if (!pedido) throw new NotFoundException(`Pedido con ID "${pedidoId}" no encontrado`);
    
    const producto = await this.productosRepository.findOneBy({ id: addItemDto.productoId });
    if (!producto) throw new NotFoundException(`Producto con ID "${addItemDto.productoId}" no encontrado`);

    const nuevoItem = this.pedidoItemsRepository.create({
        producto,
        cantidad: addItemDto.cantidad,
        precio_unitario: producto.precio,
        notas: addItemDto.notas,
        pedido,
    });
    await this.pedidoItemsRepository.save(nuevoItem);
    
    return this.recalcularTotal(pedidoId);
  }

    async updateItemCantidad(itemId: string, cantidad: number, responsable: Usuario): Promise<Pedido> {
    if (cantidad < 1) {
      throw new BadRequestException('La cantidad no puede ser menor a 1. Para eliminar, usa la opción correspondiente.');
    }
    
    const item = await this.pedidoItemsRepository.findOne({ where: { id: itemId }, relations: ['pedido'] });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    
    item.cantidad = cantidad;
    await this.pedidoItemsRepository.save(item);
    
    return this.recalcularTotal(item.pedido.id);
  }

    async transferirMesa(pedidoId: string, nuevaMesaId: string): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    if (!pedido) throw new NotFoundException('Pedido no encontrado.');
    if (!pedido.mesa) throw new BadRequestException('Este pedido no está asociado a una mesa para transferir.');

    const mesaOriginal = await this.mesasRepository.findOneBy({ id: pedido.mesa.id });
    const mesaNueva = await this.mesasRepository.findOneBy({ id: nuevaMesaId });

    if (!mesaNueva) throw new NotFoundException('La mesa de destino no existe.');
    if (mesaNueva.estado !== EstadoMesa.LIBRE) throw new ConflictException('La mesa de destino no está libre.');
    
    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Nos aseguramos de que la mesa original exista antes de intentar modificarla.
    if (mesaOriginal) {
      mesaOriginal.estado = EstadoMesa.LIBRE;
      await this.mesasRepository.save(mesaOriginal);
    }

    // Ocupamos la nueva mesa y la asignamos al pedido
    mesaNueva.estado = EstadoMesa.OCUPADA;
    await this.mesasRepository.save(mesaNueva);
    
    pedido.mesa = mesaNueva;
    return this.pedidosRepository.save(pedido);
  }

  async removeItem(itemId: string, motivo: string, responsable: Usuario): Promise<Pedido> {
    const item = await this.pedidoItemsRepository.findOne({ where: { id: itemId }, relations: ['pedido'] });
    if (!item) throw new NotFoundException(`Ítem de pedido con ID "${itemId}" no encontrado`);
    
    const pedidoId = item.pedido.id;
    console.log(`Ítem ${itemId} eliminado por ${responsable.email}. Motivo: ${motivo}`);
    
    await this.pedidoItemsRepository.remove(item);
    
    return this.recalcularTotal(pedidoId);
  }
  
  private async recalcularTotal(pedidoId: string): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    pedido.total = pedido.items.reduce((sum, currentItem) => {
        return sum + (currentItem.cantidad * Number(currentItem.precio_unitario));
    }, 0);
    return this.pedidosRepository.save(pedido);
  }

  // --- LÓGICA DE FLUJO DE TRABAJO (COCINA, CAJA) ---
    async enviarPedido(pedidoId: string): Promise<Comanda[]> {
    const pedido = await this.findOne(pedidoId);
    if (!pedido) throw new NotFoundException(`Pedido con ID "${pedidoId}" no encontrado`);
    
    const itemsParaEnviar = pedido.items.filter(item => item.estado === EstadoPedidoItem.NUEVO);
    if (itemsParaEnviar.length === 0) {
      console.log(`No hay ítems nuevos para enviar en el pedido ${pedidoId}.`);
      return [];
    }

    const comandasAGenerar: { [key in TipoComanda]?: PedidoItem[] } = {};
    for (const item of itemsParaEnviar) {
      const tipo = item.producto.categoria.nombre.toLowerCase().includes('bebida') ? TipoComanda.BARRA : TipoComanda.COCINA;
      if (!comandasAGenerar[tipo]) {
        comandasAGenerar[tipo] = [];
      }
      comandasAGenerar[tipo].push(item);
    }

    const nuevasComandas: Comanda[] = [];
    for (const tipo in comandasAGenerar) {
      if (Object.prototype.hasOwnProperty.call(comandasAGenerar, tipo)) {
        const comanda = this.comandasRepository.create({
          pedido,
          tipo: tipo as TipoComanda,
          items: comandasAGenerar[tipo as TipoComanda],
        });
        const comandaGuardada = await this.comandasRepository.save(comanda);
        nuevasComandas.push(comandaGuardada);
      }
    }

    for (const item of itemsParaEnviar) {
      item.estado = EstadoPedidoItem.ENVIADO;
      await this.pedidoItemsRepository.save(item);
    }
    
    return nuevasComandas;
  }
  
    async cerrarPedido(pedidoId: string, metodoDePago: string): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    if (!pedido) throw new NotFoundException(`Pedido con ID "${pedidoId}" no encontrado`);

    pedido.estado = EstadoPedido.CERRADO;
    
    // --- LÓGICA DE LIBERACIÓN DE MESA, AHORA EN SU LUGAR CORRECTO ---
    if (pedido.mesa) {
      const mesa = await this.mesasRepository.findOneBy({ id: pedido.mesa.id });
      if (mesa) {
        mesa.estado = EstadoMesa.NECESITA_LIMPIEZA; 
        await this.mesasRepository.save(mesa);
      }
    }
    
    const pedidoCerrado = await this.pedidosRepository.save(pedido);
    console.log(`Pedido ${pedidoId} cerrado con ${metodoDePago}. La mesa ha sido marcada para limpieza.`);
    return pedidoCerrado;
  }

  async cancelarPedido(pedidoId: string, motivo: string): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    if (pedido.estado !== EstadoPedido.ABIERTO) {
        throw new ConflictException('Solo se pueden cancelar pedidos abiertos.');
    }
    pedido.estado = EstadoPedido.CANCELADO;
    console.log(`Pedido ${pedidoId} cancelado. Motivo: ${motivo}`);
    return this.pedidosRepository.save(pedido);
  }

  // --- PEDIDOS DE FUNCIONARIO ---
  async createPedidoFuncionario(funcionario: Usuario, dto: CreatePedidoFuncionarioDto): Promise<Pedido> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const pedidoExistente = await this.pedidosRepository.findOne({ where: { mozo: { id: funcionario.id }, es_pedido_funcionario: true, fecha_apertura: MoreThanOrEqual(hoy) } });
    if (pedidoExistente) { throw new ConflictException('Ya se ha registrado un pedido de funcionario para hoy.'); }
    
    const nuevoPedido = this.pedidosRepository.create({ mozo: funcionario, es_pedido_funcionario: true, items: [] });
    let pedidoGuardado = await this.pedidosRepository.save(nuevoPedido);

    if (dto.itemsAdicionales && dto.itemsAdicionales.length > 0) {
      for (const itemDto of dto.itemsAdicionales) {
        pedidoGuardado = await this.addItem(pedidoGuardado.id, itemDto);
      }
    }
    
    return this.findOne(pedidoGuardado.id);
  }
}