import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  // MÉTODO PARA CREAR (ya lo teníamos, pero lo incluimos para que esté completo)
  async crearUsuario(datosUsuario: any): Promise<Usuario> {
    const { email, password, nombre, rol } = datosUsuario;

    const usuarioExistente = await this.usuariosRepository.findOneBy({ email });
    if (usuarioExistente) {
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = this.usuariosRepository.create({
      email,
      password_hash,
      nombre,
      rol,
    });
    return this.usuariosRepository.save(nuevoUsuario);
  }

  // --- ¡NUEVOS MÉTODOS! ---

  // MÉTODO PARA ENCONTRAR TODOS LOS USUARIOS
  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  // MÉTODO PARA ENCONTRAR UN USUARIO POR ID
  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    return usuario;
  }

  // MÉTODO PARA ENCONTRAR POR EMAIL (interno, ya lo teníamos)
  async findOneByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ email });
  }

  // MÉTODO PARA ACTUALIZAR UN USUARIO
  async update(id: string, updateUsuarioDto: any): Promise<Usuario> {
  // Si se envía una nueva contraseña, la hasheamos
  if (updateUsuarioDto.password) {
    const salt = await bcrypt.genSalt();
    updateUsuarioDto.password_hash = await bcrypt.hash(updateUsuarioDto.password, salt);
    delete updateUsuarioDto.password;
  }
  
  // La magia de 'preload' es que toma una entidad existente (por su id)
  // y fusiona los nuevos datos del DTO sobre ella.
  // Aquí nos aseguramos de que todos los campos del DTO se consideren.
  const usuario = await this.usuariosRepository.preload({
    id: id,
    ...updateUsuarioDto, // Esto incluye nombre, email, rol, telefono, fecha_contratacion, etc.
  });

  if (!usuario) {
    throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
  }
  
  return this.usuariosRepository.save(usuario);
}

  // MÉTODO PARA ELIMINAR UN USUARIO
  async remove(id: string): Promise<void> {
    const result = await this.usuariosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
  }
}