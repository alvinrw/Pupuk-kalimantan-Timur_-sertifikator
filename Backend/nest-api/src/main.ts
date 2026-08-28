import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // [FIX H-02] Batasi CORS hanya ke origin yang diizinkan, bukan wildcard '*'
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const bodyParser = require('body-parser');
  const cookieParser = require('cookie-parser');
  
  app.use(cookieParser());
  // [FIX M-03] Turunkan limit body request dari 50MB ke 5MB untuk mencegah DoS
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  // Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Prefix API
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT', 3000);

  // [FIX M-02] Hanya tampilkan Swagger di lingkungan non-produksi
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Sertifikator API Portal')
      .setDescription('Enterprise Permit Management & Intelligence API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📚 Swagger Docs available at: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`🚀 NestJS API running on: http://localhost:${port}/api/v1`);
}
bootstrap();
