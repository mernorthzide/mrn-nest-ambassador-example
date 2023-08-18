import { UsersService } from './../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private UsersService: UsersService,
  ) {}

  async user(request: Request) {
    const cookie = request.cookies['jwt'];

    const { id } = await this.jwtService.verifyAsync(cookie);

    return this.UsersService.findOne({
      where: { id },
    });
  }
}
