import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SuperHero } from './interfaces';
import { MARVEL_HEROES } from './marvel_heroes'

@Injectable()
export class MarvelHeroesService {


    public getMarvelHero(): SuperHero {
        try {
            return MARVEL_HEROES[Math.floor(Math.random() * MARVEL_HEROES.length)]
        } catch (error) {
            Logger.error(error)
            throw new HttpException("Heroes are not available now", HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }


}
