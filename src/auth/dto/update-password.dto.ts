import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Password' })
  @IsNotEmpty({
    message: 'Password is required',
  })
  password: string;

  @ApiProperty({ description: 'Password confirm' })
  @IsNotEmpty({
    message: 'Password confirm is required',
  })
  password_confirm: string;
}
