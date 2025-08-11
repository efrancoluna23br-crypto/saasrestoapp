import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa, EstadoMesa } from './mesa.entity';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private mesasRepository: Repository<Mesa>,
  ) {}

  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    const mesaExistente = await this.mesasRepository.findOneBy({ numero: createMesaDto.numero });
    if (mesaExistente) {
      throw new ConflictException(`La mesa número ${createMesaDto.numero} ya existe`);
    }
    const nuevaMesa = this.mesasRepository.create(createMesaDto);
    return this.mesasRepository.save(nuevaMesa);
  }

  findAll(): Promise<Mesa[]> {
    return this.mesasRepository.find({ order: { numero: 'ASC' } });
  }

  findAllLibres(): Promise<Mesa[]> {
    return this.mesasRepository.find({ 
        where: { estado: EstadoMesa.LIBRE },
        order: { numero: 'ASC' } 
    });
  }

  async findOne(id: string): Promise<Mesa> {
    const mesa = await this.mesasRepository.findOneBy({ id });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID "${id}" no encontrada`);
    }
    return mesa;
  }
  
  async updateEstado(id: string, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(id);
    mesa.estado = updateMesaDto.estado;
    return this.mesasRepository.save(mesa);
  }
}