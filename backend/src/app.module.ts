import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Nuestros Módulos de Funcionalidades
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { MesasModule } from './mesas/mesas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { FeedbackModule } from './feedback/feedback.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { ComandasModule } from './comandas/comandas.module';
import { NotificationsModule } from './notifications/notifications.module'; 
import { CajaModule } from './caja/caja.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AusenciasModule } from './ausencias/ausencias.module';


@Module({
  imports: [
    // Módulo para servir archivos estáticos (nuestro frontend de prueba).
    // Debe ir primero para interceptar la ruta raíz.
    ServeStaticModule.forRoot({
      // process.cwd() apunta a la raíz del proyecto (la carpeta 'backend')
      rootPath: join(process.cwd(), 'public'), 
    }),

    // Módulo de Configuración para variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Módulo de TypeORM para la conexión a la Base de Datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        authPlugin: 'mysql_native_password',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    // El resto de los módulos de nuestra aplicación
    AuthModule,
    UsuariosModule,
    ProductosModule,
    MesasModule,
    PedidosModule,
    ComandasModule,
    CajaModule,
    NotificationsModule,
    AsistenciaModule,
    FeedbackModule,
    AsistenciaModule,
    AusenciasModule,
    FeedbackModule,
  ],
 // controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}