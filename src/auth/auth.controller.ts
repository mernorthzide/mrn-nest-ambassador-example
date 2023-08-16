import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('admin/register')
  async register(@Body() registerDto: RegisterDto) {
    const { password_confirm, ...data } = registerDto;

    // Check confirm password
    if (registerDto.password !== password_confirm) {
      throw new BadRequestException('Password and confirm password not match');
    }

    // Hash password
    const hashed = await bcrypt.hash(registerDto.password, 12);

    return this.authService.register({
      ...data,
      password: hashed,
      password_confirm: '',
      is_ambassador: false,
    });
  }

  @Post('admin/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Get user
    const user = await this.authService.getUserByEmail(loginDto.email);

    // Check user
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check password
    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate token
    const jwt = await this.jwtService.signAsync({ id: user.id });

    // Set cookie
    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'Success',
    };
  }

  @Get('admin/user')
  async user(@Req() request: Request) {
    const cookie = request.cookies['jwt'];

    const { id } = await this.jwtService.verifyAsync(cookie);

    return this.authService.getUserById(id);
  }
}
