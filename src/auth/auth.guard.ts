import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    try {
      const jwt = request.cookies['jwt'];
      const { scope } = await this.jwtService.verify(jwt);

      const is_ambassador = request.path.includes('ambassador') ? true : false;

      return (
        (is_ambassador && scope.includes('ambassador')) ||
        (!is_ambassador && scope.includes('admin'))
      );
    } catch (error) {
      return false;
    }
  }
}
