import { Controller } from '@nestjs/common';
import { ComandasService } from './comandas.service';

@Controller('comandas/v1')
export class ComandasController {
    constructor(private readonly comandasService: ComandasService) {}
}