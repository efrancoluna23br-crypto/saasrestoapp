import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Ausencia } from './ausencia.entity';
import { CreateAusenciaDto } from './dto/create-ausencia.dto';
// La línea que importaba 'UpdateAusenciaDto' ha sido eliminada.

@Injectable()
export class AusenciasService {
  constructor(
    @InjectRepository(Ausencia)
    private ausenciasRepository: Repository<Ausencia>,
  ) {}

  create(createAusenciaDto: CreateAusenciaDto): Promise<Ausencia> {
    const nuevaAusencia = this.ausenciasRepository.create({
      ...createAusenciaDto,
      usuario: { id: createAusenciaDto.usuarioId },
    });
    return this.ausenciasRepository.save(nuevaAusencia);
  }

  findAllForUser(usuarioId: string): Promise<Ausencia[]> {
    return this.ausenciasRepository.find({ where: { usuario: { id: usuarioId } }, order: { fechaInicio: 'DESC' } });
  }

  async findOne(id: string): Promise<Ausencia> {
    const ausencia = await this.ausenciasRepository.findOneBy({ id });
    if (!ausencia) throw new NotFoundException(`Ausencia con ID "${id}" no encontrada.`);
    return ausencia;
  }
  
  async addCertificado(id: string, filePath: string): Promise<Ausencia> {
    const ausencia = await this.findOne(id);
    ausencia.certificadoUrl = filePath;
    return this.ausenciasRepository.save(ausencia);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ausenciasRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Ausencia con ID "${id}" no encontrada.`);
  }

  async findAusenciasPorRango(usuarioId: string, fechaInicioStr: string, fechaFinStr: string): Promise<Ausencia[]> {
    if (!fechaInicioStr || !fechaFinStr) {
      throw new BadRequestException('Se requieren fecha de inicio y fecha de fin.');
    }
    
    const fechaInicio = new Date(fechaInicioStr);
    const fechaFin = new Date(fechaFinStr);

    const queryOptions: FindManyOptions<Ausencia> = {
        where: {
            fechaInicio: MoreThanOrEqual(fechaInicio),
            fechaFin: LessThanOrEqual(fechaFin),
        },
        order: { fechaInicio: 'ASC' },
        relations: ['usuario'],
    };

    if (usuarioId !== 'todos') {
        (queryOptions.where as any).usuario = { id: usuarioId };
    }

    return this.ausenciasRepository.find(queryOptions);
  }
}