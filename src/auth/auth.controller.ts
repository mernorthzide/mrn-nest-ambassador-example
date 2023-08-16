import { UsersService } from './../users/users.service';
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
  UnauthorizedException,
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
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(['admin/register', 'ambassador/register'])
  async register(@Body() registerDto: RegisterDto, @Req() request: Request) {
    const { password_confirm, ...data } = registerDto;

    // Check confirm password
    if (registerDto.password !== password_confirm) {
      throw new BadRequestException('Password and confirm password not match');
    }

    // Hash password
    const hashed = await bcrypt.hash(registerDto.password, 12);

    // Create user
    await this.usersService.create({
      ...data,
      password: hashed,
      password_confirm: '',
      is_ambassador: request.path.includes('ambassador') ? true : false,
    });

    return {
      message: 'Success',
    };
  }

  @Post(['admin/login', 'ambassador/login'])
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    // Get user
    const user = await this.usersService.findOne({
      where: { email: loginDto.email },
    });

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

    // Check is ambassador
    const is_ambassador = request.path.includes('ambassador') ? true : false;

    if (is_ambassador && !user.is_ambassador) {
      throw new UnauthorizedException();
    }

    // Generate token
    const jwt = await this.jwtService.signAsync({
      id: user.id,
      scope: is_ambassador ? 'ambassador' : 'admin',
    });

    // Set cookie
    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'Success',
    };
  }

  @UseGuards(AuthGuard)
  @Get(['admin/user', 'ambassador/user'])
  async user(@Req() request: Request) {
    // Get cookie
    const cookie = request.cookies['jwt'];

    // Verify cookie
    const { id } = await this.jwtService.verifyAsync(cookie);

    // Check admin
    if (request.path.includes('admin')) {
      return this.usersService.findOne({
        where: { id },
      });
    }

    // Get user
    const user = await this.usersService.findOne({
      where: { id },
      relations: ['orders', 'orders.order_items'],
    });

    const { orders, password, ...data } = user;

    return {
      ...data,
      revenue: user.revenue,
    };
  }

  @UseGuards(AuthGuard)
  @Post(['admin/logout', 'ambassador/logout'])
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear cookie
    response.clearCookie('jwt');

    return {
      message: 'Success',
    };
  }

  @UseGuards(AuthGuard)
  @Post(['admin/users/info', 'ambassador/users/info'])
  async updateInfo(
    @Req() request: Request,
    @Body() updateInfoDto: UpdateInfoDto,
  ) {
    // Get cookie
    const cookie = request.cookies['jwt'];

    // Verify cookie
    const { id } = await this.jwtService.verifyAsync(cookie);

    // Update user
    await this.usersService.update(id, updateInfoDto);

    // Get user
    return this.usersService.findOne({
      where: { id },
    });
  }

  @UseGuards(AuthGuard)
  @Post(['admin/users/password', 'ambassador/users/password'])
  async updatePassword(
    @Req() request: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    // Check confirm password
    if (updatePasswordDto.password !== updatePasswordDto.password_confirm) {
      throw new BadRequestException('Password and confirm password not match');
    }

    // Get cookie
    const cookie = request.cookies['jwt'];

    // Verify cookie
    const { id } = await this.jwtService.verifyAsync(cookie);

    // Hash password
    const hashed = await bcrypt.hash(updatePasswordDto.password, 12);

    // Update user password
    await this.usersService.update(id, {
      password: hashed,
    });

    return {
      message: 'Success',
    };
  }
}
