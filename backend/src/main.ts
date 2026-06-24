// import { ValidationPipe } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );

//   await app.listen(process.env.PORT ?? 3000);

//   console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
// }

// bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('VBA Connect Video Service API')
    .setDescription(
      'Reusable Video Communication Service powered by NestJS + LiveKit OSS',
    )
    .setVersion('1.0.0')
    .addTag('Video')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`,
  );

  console.log(
    `📚 Swagger Docs: http://localhost:${process.env.PORT ?? 3000}/api`,
  );

}

bootstrap();