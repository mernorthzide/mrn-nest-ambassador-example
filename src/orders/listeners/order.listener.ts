import { Order } from 'src/orders/entities/order.entity';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/shared/redis.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OrderListener {
  constructor(
    private redisService: RedisService,
    private mailerService: MailerService,
  ) {}

  @OnEvent('order.completed')
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();

    // Increment ambassador revenue
    client.zincrby('rankings', order.ambassador_revenue, order.user.name);

    // Send email
    await this.mailerService.sendMail({
      to: 'admin@admin.com',
      subject: 'An order has been completed',
      html: `Order ${order.id} with a total of ${order.total} has been completed!`,
    });

    // Send email to ambassador
    await this.mailerService.sendMail({
      to: order.ambassador_email,
      subject: 'You have a new order!',
      html: `You earned $${order.ambassador_revenue} from the link ${order.code}`,
    });
  }
}
