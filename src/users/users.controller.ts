import { RedisService } from './../shared/redis.service';
import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';
import { Response } from 'express';

@ApiTags('Users')
@Controller()
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  @Get('amin/ambassadors')
  getAmbassadors() {
    return this.usersService.findAll({
      where: {
        is_ambassador: true,
      },
    });
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

  @Get('ambassador/rankings')
  async rankings(@Res() response: Response) {
    const client = this.redisService.getClient();

    client.zrevrangebyscore(
      'rankings',
      '+inf',
      '-inf',
      'withscores',
      (err, result) => {
        let score;

        response.send(
          result.reduce((o, r) => {
            if (isNaN(parseInt(r))) {
              return {
                ...o,
                [r]: score,
              };
            } else {
              score = parseInt(r);
              return o;
            }
          }, {}),
        );
      },
    );
  }

  // Generate fake data
  @Get('ambassador/generate-fake-data/rankings')
  async generateFakeDataRankings() {
    const ambassadors: User[] = await this.usersService.findAll({
      where: {
        is_ambassador: true,
      },
      relations: ['orders', 'orders.order_items'],
    });

    const client = this.redisService.getClient();

    for (let i = 0; i < ambassadors.length; i++) {
      await client.zadd(
        'rankings',
        ambassadors[i].revenue,
        ambassadors[i].name,
      );
    }

    return {
      message: 'rankings created',
    };
  }
}
