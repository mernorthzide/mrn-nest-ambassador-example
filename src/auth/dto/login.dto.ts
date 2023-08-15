import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email' })
  @IsNotEmpty({
    message: 'Email is required',
  })
  email: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty({
    message: 'Password is required',
  })
  password: string;
}
