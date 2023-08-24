import { Order } from 'src/orders/entities/order.entity';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/shared/redis.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class OrderListener {
  constructor(private redisService: RedisService) {}

  @OnEvent('order.completed')
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();
    client.zincrby('rankings', order.ambassador_revenue, order.user.name);
  }
}
