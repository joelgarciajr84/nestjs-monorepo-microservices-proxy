import { Module } from "@nestjs/common";
import { HttpService, HttpModule } from "@nestjs/axios"
import { ConfigModule } from "@nestjs/config";
import { AuthGuard } from "./auth.guard";
import { DCController } from "./dc.controller";
import { DCHeroesService } from "./dc.service";


@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [DCController],
  providers: [DCHeroesService, AuthGuard],
})
export class DCModule { }
