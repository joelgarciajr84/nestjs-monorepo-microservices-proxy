import { Module } from "@nestjs/common";
import { HttpModule, } from "@nestjs/axios"
import { ConfigModule } from '@nestjs/config';
import { DCModule } from "./dc.module";

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({isGlobal:true, envFilePath:['../.env']}),
    DCModule,
  ],
  providers:[]
})
export class AppModule { }