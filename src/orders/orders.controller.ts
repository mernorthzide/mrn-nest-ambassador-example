import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { randomInt } from 'crypto';
import { faker } from '@faker-js/faker';
import { ApiTags } from '@nestjs/swagger';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderItemsService: OrderItemsService,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll({
      relations: ['order_items'],
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne({
      where: { id: +id },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  // Generate fake data
  @Get('generate-fake-data/:number')
  async generateFakeData(@Param('number') number: number) {
    // Create products
    for (let i = 0; i < number; i++) {
      const order = await this.ordersService.create({
        user_id: randomInt(1, 100),
        code: faker.lorem.slug(2),
        ambassador_email: faker.internet.email(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        complete: true,
      });

      for (let j = 0; j < randomInt(1, 5); j++) {
        await this.orderItemsService.create({
          order,
          product_title: faker.lorem.words(2),
          price: faker.commerce.price(),
          quantity: randomInt(1, 5),
          admin_revenue: faker.commerce.price(),
          ambassador_revenue: faker.commerce.price(),
        });
      }
    }

    return {
      message: number + ' products created',
    };
  }
}
