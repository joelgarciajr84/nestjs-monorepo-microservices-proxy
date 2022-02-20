import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';


async function bootstrap() {
  
  const looger = new Logger('bootsrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.DC_API_PORT || 3002;


  const options = new DocumentBuilder()
    .setTitle('DC API')
    .setDescription('Simple DC Heroes API with Nest JS')
    .setVersion('1.0')
    .addTag('v1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);  
  await app.listen(port);

  looger.log(`DC API running on port ${port}`);
}
bootstrap();
