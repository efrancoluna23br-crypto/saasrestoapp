import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm'; // <-- ¡AQUÍ ESTÁ LA CORRECCIÓN!
import { Fichaje, TipoFichaje } from './fichaje.entity';
import { Usuario } from '../usuarios/v1/usuario.entity';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Fichaje)
    private fichajesRepository: Repository<Fichaje>,
  ) {}

  async findRegistrosDeHoy(): Promise<any> {
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDelDia = new Date(hoy.setHours(23, 59, 59, 999));

    const fichajesDeHoy = await this.fichajesRepository.find({
      relations: ['usuario'],
      where: {
        timestamp: Between(inicioDelDia, finDelDia),
      },
      order: { timestamp: 'ASC' },
    });

    const registrosAgrupados = fichajesDeHoy.reduce((acc, fichaje) => {
      if (!fichaje.usuario) return acc;
      const usuarioId = fichaje.usuario.id;
      if (!acc[usuarioId]) {
        acc[usuarioId] = {
          usuario: {
            id: fichaje.usuario.id,
            nombre: fichaje.usuario.nombre,
          },
          fichajes: [],
        };
      }
      acc[usuarioId].fichajes.push({
        tipo: fichaje.tipo,
        timestamp: fichaje.timestamp,
      });
      return acc;
    }, {});

    return Object.values(registrosAgrupados);
  }

  async registrarFichaje(usuarioId: string, tipo: TipoFichaje): Promise<Fichaje> {
    const ultimoFichaje = await this.fichajesRepository.findOne({
      where: { usuario: { id: usuarioId } },
      order: { timestamp: 'DESC' },
    });

    if (ultimoFichaje && ultimoFichaje.tipo === tipo) {
      throw new BadRequestException(`Ese usuario ya tiene una "${tipo}" como último movimiento.`);
    }

    const resultadoInsert = await this.fichajesRepository.insert({
      usuario: { id: usuarioId },
      tipo,
    });

    const idNuevoFichaje = resultadoInsert.identifiers[0].id;
    const fichajeCreado = await this.fichajesRepository.findOneBy({ id: idNuevoFichaje });

    if (!fichajeCreado) {
      throw new NotFoundException(`Error crítico: No se pudo encontrar el fichaje recién creado.`);
    }

    return fichajeCreado;
  }

  async findFichajesPorRango(usuarioId: string, fechaInicioStr: string, fechaFinStr: string): Promise<Fichaje[]> {
    if (!fechaInicioStr || !fechaFinStr) {
      throw new BadRequestException('Se requieren fecha de inicio y fecha de fin.');
    }
    
    const fechaInicio = new Date(fechaInicioStr);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fechaFinStr);
    fechaFin.setHours(23, 59, 59, 999);

    const queryOptions: FindManyOptions<Fichaje> = {
        relations: ['usuario'],
        where: {
            timestamp: Between(fechaInicio, fechaFin),
        },
        order: { timestamp: 'ASC' },
    };

    if (usuarioId !== 'todos') {
        (queryOptions.where as any).usuario = { id: usuarioId };
    }

    return this.fichajesRepository.find(queryOptions);
  }
}