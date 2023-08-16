import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Title' })
  title?: string;

  @ApiProperty({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Image' })
  image?: string;

  @ApiProperty({ description: 'Price' })
  price?: number;
}
