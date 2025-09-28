import {CanActivate, ExecutionContext, Injectable, Scope} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();


    const authHeader = request.headers['authorization'] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    try {
      this.jwtService.verify(token);
      return true;
    } catch (err) {
      return false;
    }
  }
}
