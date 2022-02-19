import { Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { MarvelModule } from "./marvel.module";


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true, envFilePath:['../.env']}),
    MarvelModule,
  ],
})
export class AppModule { }