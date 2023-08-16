import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateInfoDto {
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
}
