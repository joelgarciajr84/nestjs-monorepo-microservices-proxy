import { Module } from "@nestjs/common";
import { HttpModule, } from "@nestjs/axios"
import { ConfigModule } from '@nestjs/config';
import { MarvelModule } from "./marvel.module";


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({isGlobal:true, envFilePath:['../.env']}),
    MarvelModule,
  ],
  providers:[]
})
export class AppModule { }