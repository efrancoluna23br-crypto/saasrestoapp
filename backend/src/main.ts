import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { join } from 'path'; // <-- Importa 'join'
import { NestExpressApplication } from '@nestjs/platform-express'; // <-- Importa esto

async function bootstrap() {
  // Usamos NestExpressApplication para tener acceso a métodos de Express como useStaticAssets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- CONFIGURACIÓN DE CORS REFORZADA ---
  app.enableCors({
    origin: 'http://200.58.121.205:3520', // Permite explícitamente a tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Configuración para servir archivos estáticos (los certificados)
  // Esto le dice a NestJS que la carpeta /public es accesible desde la web
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/', // Accederás a ellos desde http://tu-backend.com/certificados/archivo.pdf
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // No permite propiedades que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3523);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();