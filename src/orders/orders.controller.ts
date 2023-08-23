import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { randomInt } from 'crypto';
import { faker } from '@faker-js/faker';
import { ApiTags } from '@nestjs/swagger';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { LinksService } from 'src/links/links.service';
import { Order } from './entities/order.entity';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderItemsService: OrderItemsService,
    private readonly linksService: LinksService,
    private readonly productsService: ProductsService,
  ) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/orders')
  all() {
    return this.ordersService.findAll({
      relations: ['order_items'],
    });
  }

  @Post('checkout/orders')
  async create(@Body() createOrderDto: CreateOrderDto) {
    const link = await this.linksService.findOne({
      where: { code: createOrderDto.code },
      relations: ['user'],
    });

    if (!link) {
      throw new BadRequestException('Invalid link');
    }

    const o = new Order();
    o.user_id = link.user.id;
    o.ambassador_email = link.user.email;
    o.first_name = createOrderDto.first_name;
    o.last_name = createOrderDto.last_name;
    o.email = createOrderDto.email;
    o.address = createOrderDto.address;
    o.country = createOrderDto.country;
    o.city = createOrderDto.city;
    o.zip = createOrderDto.zip;
    o.code = createOrderDto.code;

    const order = await this.ordersService.create(o);

    for (const p of createOrderDto.products) {
      const product: Product = await this.productsService.findOne({
        where: { id: p.product_id },
      });

      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.product_title = product.title;
      orderItem.price = product.price;
      orderItem.quantity = p.quantity;
      orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
      orderItem.admin_revenue = 0.9 * product.price * p.quantity;

      await this.orderItemsService.create(orderItem);
    }

    return order;
  }

  // Generate fake data
  @Get('orders/generate-fake-data/:number')
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
