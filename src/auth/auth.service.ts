import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { UpdateInfoDto } from './dto/update-info.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  register(registerDto: RegisterDto) {
    return this.userRepository.save(registerDto);
  }

  getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  getUserById(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  updateUserById(id: number, updateInfoDto: UpdateInfoDto) {
    return this.userRepository.update(id, updateInfoDto);
  }

  updateUserPassword(id: number, password: string) {
    return this.userRepository.update(id, { password });
  }
}
