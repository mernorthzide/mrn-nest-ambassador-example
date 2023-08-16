import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'First name' })
  @IsNotEmpty({
    message: 'First name is required',
  })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  @IsNotEmpty({
    message: 'Last name is required',
  })
  last_name: string;

  @ApiProperty({ description: 'Email', example: 'string@string.com' })
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail(
    {},
    {
      message: 'Email is not valid',
    },
  )
  email: string;

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
