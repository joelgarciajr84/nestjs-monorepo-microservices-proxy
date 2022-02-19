import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';


async function bootstrap() {
  
  const looger = new Logger('bootsrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.MARVEL_API_PORT || 3001;


  const options = new DocumentBuilder()
    .setTitle('Marvel API')
    .setDescription('Simple Marvel Heroes API with Nest JS')
    .setVersion('1.0')
    .addTag('v1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);  
  await app.listen(port);

  looger.log(`Marvel API running on port ${port}`);
}
bootstrap();
