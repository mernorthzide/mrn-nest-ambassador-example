import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
