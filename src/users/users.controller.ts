import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ambassadors')
  getAmbassadors() {
    return this.usersService.getAmbassadors();
  }

  // Generate fake data
  @Get('generate-fake-data')
  async generateFakeData() {
    // Generate password hash
    const password = await bcrypt.hash('1234', 12);

    // Create 30 users
    for (let i = 0; i < 30; i++) {
      await this.usersService.create({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: password,
        is_ambassador: true,
      });
    }

    return {
      message: '30 users created',
    };
  }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
