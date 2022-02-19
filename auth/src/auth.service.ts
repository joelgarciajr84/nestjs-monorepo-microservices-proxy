import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCrendentialsDto } from './dto/auth-credentials.dto';
import { AccessToken, JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    private users: Array<AuthCrendentialsDto> = []
    constructor(
        private readonly jwtService: JwtService
    ) { }

    public async signUp(authCredentialsDto: AuthCrendentialsDto): Promise<boolean> {
        try {

            return !!this.users.push(authCredentialsDto)
        } catch (error) {
            console.debug(error)
            throw new Error("Error on insert new user");
        }
    }

    public async signIn(authCredentialsDto: AuthCrendentialsDto): Promise<AccessToken> {


        const user = this.isUser(authCredentialsDto.username)
        const { username } = user
        if (!username) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = { username };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }


    public isUser(username: string) {
        return this.users.find((user) => user.username === username);
    }

    public checkToken(token: string): boolean {
        try {

            return !!this.jwtService.verify(token)

        } catch (error) {
            Logger.error(error)
            throw new HttpException("", HttpStatus.FORBIDDEN)
        }

    }
}
