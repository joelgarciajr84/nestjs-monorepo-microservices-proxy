import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';


async function bootstrap() {
  
  const looger = new Logger('bootsrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;


  const options = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Simple Auth API with Nest JS')
    .setVersion('1.0')
    .addTag('v1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);  
  await app.listen(port);

  looger.log(`Auth API running on port ${port}`);
}
bootstrap();
