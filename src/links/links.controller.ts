import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { CreateLinkDto } from './dto/create-link.dto';

@ApiTags('Link')
@Controller()
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/users/:id/links')
  findByUser(@Param('id') id: string) {
    return this.linksService.findAll({
      where: { user: +id },
      relations: ['orders'],
    });
  }

  @UseGuards(AuthGuard)
  @Post('ambassador/links')
  async create(@Body() createLinkDto: CreateLinkDto, @Req() request: Request) {
    const user = await this.authService.user(request);

    return this.linksService.create({
      code: Math.random().toString(36).substring(6),
      user: user.id,
      products: createLinkDto.products.map((id) => ({ id })),
    });
  }
}
