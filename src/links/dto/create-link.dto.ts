import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({ description: 'The products of the link', type: [Number] })
  products: number[];
}
