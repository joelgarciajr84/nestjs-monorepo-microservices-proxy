import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MarvelController } from "./marvel.controller";
import { MarvelHeroesService } from "./marvel.service";

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [MarvelController],
  providers: [MarvelHeroesService],
})
export class MarvelModule { }
