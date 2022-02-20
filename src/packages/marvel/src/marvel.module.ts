import { Module } from "@nestjs/common";
import { HttpService, HttpModule} from "@nestjs/axios"
import { ConfigModule } from "@nestjs/config";
import { AuthGuard } from "./auth.guard";
import { MarvelController } from "./marvel.controller";
import { MarvelHeroesService } from "./marvel.service";

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [MarvelController],
  providers: [MarvelHeroesService, AuthGuard],
})
export class MarvelModule { }
