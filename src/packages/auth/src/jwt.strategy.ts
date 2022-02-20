import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { AuthCrendentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey:`${process.env.JWT_SECRET_KEY}`,
        });
    }

    public async validate(payload: JwtPayload): Promise<AuthCrendentialsDto> {
        const user = this.authService.isUser(payload.username);
        const { username } = user

        if (!username) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
