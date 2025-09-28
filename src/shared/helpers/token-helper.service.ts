import {Injectable, Scope} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable({ scope: Scope.REQUEST })
export class TokenHelper {
    constructor(private readonly jwtService: JwtService) {}

    createToken(payload: object): string {
        return this.jwtService.sign(payload);
    }
}
