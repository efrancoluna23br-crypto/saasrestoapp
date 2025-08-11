import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../usuarios/v1/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);