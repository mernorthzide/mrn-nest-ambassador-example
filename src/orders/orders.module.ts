import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { SharedModule } from 'src/shared/shared.module';
import { LinksModule } from 'src/links/links.module';
import { ProductsModule } from 'src/products/products.module';
import { StripeModule } from 'nestjs-stripe';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    SharedModule,
    LinksModule,
    ProductsModule,
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_API_KEY'),
        apiVersion: '2020-08-27',
      }),
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderItemsService],
})
export class OrdersModule {}
