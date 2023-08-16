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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { UpdateInfoDto } from './dto/update-info.dto';

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

    // Create user
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

    // Check match
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

  @UseGuards(AuthGuard)
  @Get('admin/user')
  async user(@Req() request: Request) {
    // Get cookie
    const cookie = request.cookies['jwt'];

    // Verify cookie
    const { id } = await this.jwtService.verifyAsync(cookie);

    // Get user
    return this.authService.getUserById(id);
  }

  @UseGuards(AuthGuard)
  @Post('admin/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear cookie
    response.clearCookie('jwt');

    return {
      message: 'Success',
    };
  }

  // Update Info
  @UseGuards(AuthGuard)
  @Post('admin/users/info')
  async updateInfo(
    @Req() request: Request,
    @Body() updateInfoDto: UpdateInfoDto,
  ) {
    // Get cookie
    const cookie = request.cookies['jwt'];

    // Verify cookie
    const { id } = await this.jwtService.verifyAsync(cookie);

    // Update user
    await this.authService.updateUserById(id, updateInfoDto);

    // Get user
    return this.authService.getUserById(id);
  }
}
