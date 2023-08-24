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
import { Connection } from 'typeorm';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private orderItemsService: OrderItemsService,
    private linksService: LinksService,
    private productsService: ProductsService,
    private connection: Connection,
    @InjectStripe() private readonly stripeClient: Stripe,
    private configService: ConfigService,
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

    // Creare query runner
    const queryRunner = this.connection.createQueryRunner();

    try {
      // Connect to database
      await queryRunner.connect();

      // Start transaction
      await queryRunner.startTransaction();

      // order
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

      // Save order
      const order = await queryRunner.manager.save(o);

      // line items
      const line_items = [];

      // order items
      for (const p of createOrderDto.products) {
        // Get product
        const product: Product = await this.productsService.findOne({
          where: { id: p.product_id },
        });

        // Create order item
        const orderItem = new OrderItem();
        orderItem.order = order;
        orderItem.product_title = product.title;
        orderItem.price = product.price;
        orderItem.quantity = p.quantity;
        orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
        orderItem.admin_revenue = 0.9 * product.price * p.quantity;

        await queryRunner.manager.save(orderItem);

        // Add line item
        line_items.push({
          name: product.title,
          description: product.description,
          images: [product.image],
          amount: product.price * 100,
          currency: 'usd',
          quantity: p.quantity,
        });
      }

      // Create stripe session
      const source = await this.stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        success_url: `${this.configService.get(
          'CHECKOUT_URL',
        )}/success?source={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('CHECKOUT_URL')}/error`,
      });

      // Update order
      order.transaction_id = source.id;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return source;
    } catch (e) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException(e.message);
    } finally {
      await queryRunner.release();
    }
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
