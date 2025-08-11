import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda } from './comanda.entity';

@Injectable()
export class ComandasService {
    constructor(
        @InjectRepository(Comanda)
        private comandasRepository: Repository<Comanda>,
    ) {}
}