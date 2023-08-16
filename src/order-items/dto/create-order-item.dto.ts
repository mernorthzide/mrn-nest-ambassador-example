import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product title' })
  product_title: string;

  @ApiProperty({ description: 'Price' })
  price: number;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Admin revenue' })
  admin_revenue: number;

  @ApiProperty({ description: 'Ambassador revenue' })
  ambassador_revenue: number;

  @ApiProperty({ description: 'Order' })
  order_id: number;
}
