import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { DCHeroesService } from './dc.service';
import { SuperHero } from './interfaces';

@Controller('DC')
@UseGuards(AuthGuard)
export class DCController {

    constructor(private readonly DC: DCHeroesService){}

    @Get('/hero/')
    public async getRandomDCHero(): Promise<SuperHero> {
        
        return this.DC.getDCHero()
    }
}
