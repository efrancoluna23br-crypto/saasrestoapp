import {
  Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { AusenciasService } from './ausencias.service';
import { CreateAusenciaDto } from './dto/create-ausencia.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../usuarios/v1/usuario.entity';

@Controller('ausencias')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AusenciasController {
  constructor(private readonly ausenciasService: AusenciasService) {}

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  create(@Body() createAusenciaDto: CreateAusenciaDto) {
    return this.ausenciasService.create(createAusenciaDto);
  }

  @Get('usuario/:usuarioId')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  findAllForUser(@Param('usuarioId') usuarioId: string) {
    return this.ausenciasService.findAllForUser(usuarioId);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.ausenciasService.remove(id);
  }

  // --- ENDPOINT DE SUBIDA DE ARCHIVO CORREGIDO ---
  @Post(':id/certificado')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/certificados',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const extension = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${extension}`);
      },
    }),
    // Añadimos un filtro de archivos aquí también
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
            return cb(new Error('¡Solo se permiten archivos de imagen o PDF!'), false);
        }
        cb(null, true);
    },
  }))
  // Hacemos el validador opcional para que el filtro actúe primero
  uploadCertificado(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Archivo no subido o filtrado.');
    }
    const filePath = `/certificados/${file.filename}`;
    return this.ausenciasService.addCertificado(id, filePath);
  }
  
  @Get('reporte/:usuarioId')
  @Roles(RolUsuario.ADMIN, RolUsuario.CAJERO)
  getReporteDeAusencias(
    @Param('usuarioId') usuarioId: string, 
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.ausenciasService.findAusenciasPorRango(usuarioId, fechaInicio, fechaFin);
  }
}