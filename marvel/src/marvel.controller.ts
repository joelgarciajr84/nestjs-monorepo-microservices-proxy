import { Controller, Get } from '@nestjs/common';
import { SuperHero } from './interfaces';
import { MarvelHeroesService } from './marvel.service';

@Controller('marvel')
export class MarvelController {

    constructor(private readonly marvel: MarvelHeroesService){}

    @Get('/hero/')
    public async getRandomMarvelHero(): Promise<SuperHero> {
        
        return this.marvel.getMarvelHero()
    }
}
