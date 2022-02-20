import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SuperHero } from './interfaces';
import { DC_HEROES } from './dc_heroes'

@Injectable()
export class DCHeroesService {


    public getDCHero(): SuperHero {
        try {
            return DC_HEROES[Math.floor(Math.random() * DC_HEROES.length)]
        } catch (error) {
            Logger.error(error)
            throw new HttpException("Heroes are not available now", HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }


}
