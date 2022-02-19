import { Controller, Get } from '@nestjs/common';
import { MarvelHeroesService } from './marvel.service';

@Controller('marvel')
export class MarvelController {

    constructor(private readonly marvel: MarvelHeroesService){}

    @Get('/hero/')
    public async getRandomMarvelHero(): Promise<any> {
        
        return this.marvel.getMarvelHero()
    }
}
