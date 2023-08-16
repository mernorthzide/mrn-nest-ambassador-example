import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ambassadors')
  getAmbassadors() {
    return this.usersService.findAll({
      where: {
        is_ambassador: true,
      },
    });
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({
      where: { id: +id },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Generate fake data
  @Get('generate-fake-data/:number')
  async generateFakeData(@Param('number') number: number) {
    // Generate password hash
    const password = await bcrypt.hash('1234', 12);

    // Create users
    for (let i = 0; i < number; i++) {
      await this.usersService.create({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: password,
        is_ambassador: true,
      });
    }

    return {
      message: number + ' users created',
    };
  }
}
