import { Injectable, CanActivate, ExecutionContext, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios'


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private httpService: HttpService) { }

     public async canActivate( context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const { authorization } = request.headers

        if (!authorization) return false

        const token = authorization.replace("Bearer", "").trim()
        
       
        return await (this.validateToken(token))
    }

    private async validateToken(token: string): Promise<boolean> {

        try {
            const endpoint = `${process.env.TOKEN_VERIFY_SVC}/${token}`
            const getTokenValidationRequest = this.httpService.get(endpoint)

            const result = await lastValueFrom(getTokenValidationRequest);
            return result.status === HttpStatus.OK
        } catch (error) {
            Logger.error(error)
            throw new HttpException("Not allowed", HttpStatus.FORBIDDEN)
        }
    }
}