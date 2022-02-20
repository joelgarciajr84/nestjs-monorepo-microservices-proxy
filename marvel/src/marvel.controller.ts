import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SuperHero } from './interfaces';
import { MarvelHeroesService } from './marvel.service';

@Controller('marvel')
@UseGuards(AuthGuard)
export class MarvelController {

    constructor(private readonly marvel: MarvelHeroesService){}

    @Get('/hero/')
    public async getRandomMarvelHero(): Promise<SuperHero> {
        
        return this.marvel.getMarvelHero()
    }
}
