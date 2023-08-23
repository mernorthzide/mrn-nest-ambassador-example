import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Address' })
  address: string;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'Zip' })
  zip: string;

  @ApiProperty({ description: 'Code' })
  code: string;

  @ApiProperty({ description: 'Products' })
  products: {
    product_id: number;
    quantity: number;
  }[];
}
