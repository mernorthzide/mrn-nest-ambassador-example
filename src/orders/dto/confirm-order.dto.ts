import { ApiProperty } from '@nestjs/swagger';

export class ConfirmOrderDto {
  @ApiProperty({ description: 'Source' })
  source: string;
}
