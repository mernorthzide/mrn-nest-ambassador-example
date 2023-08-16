import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'Email', example: 'string@string.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password' })
  password: string;

  @ApiProperty({ description: 'Is ambassador' })
  is_ambassador: boolean;
}
