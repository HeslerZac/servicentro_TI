import { NestFactory } from '@nestjs/core';
import { AplicacionModulo } from './aplicacion.modulo';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function iniciarAplicacion() {
  const aplicacion = await NestFactory.create(AplicacionModulo);
  const prefijo =
    process.env.API_PREFIJO ?? process.env.API_PREFIX ?? '/api/v1';
  aplicacion.setGlobalPrefix(prefijo.replace(/^\//, ''));

  // Validación y transformación global
  aplicacion.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS (permitir todos o lista separada por coma en CORS_ORIGINS)
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  aplicacion.enableCors({
    origin: corsOrigins?.length ? corsOrigins : true,
    credentials: true,
  });

  // Swagger
  const builder = new DocumentBuilder()
    .setTitle('Servicentro API')
    .setDescription('Documentacion de la API del Servicentro')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(aplicacion, builder);
  SwaggerModule.setup(
    (prefijo.replace(/^\//, '') || '') + '/docs',
    aplicacion,
    document,
    {
      swaggerOptions: { persistAuthorization: true },
    },
  );

  await aplicacion.listen(process.env.PORT || 3000);
}

void iniciarAplicacion();
