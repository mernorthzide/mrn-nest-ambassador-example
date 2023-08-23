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
import { Link } from './entities/link.entity';
import { Order } from 'src/orders/entities/order.entity';

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

  @UseGuards(AuthGuard)
  @Get('ambassador/stats')
  async stats(@Req() request: Request) {
    const user = await this.authService.user(request);

    const links: Link[] = await this.linksService.findAll({
      where: { user: user.id },
      relations: ['orders'],
    });

    return links.map((link) => {
      const completedOrders: Order[] = link.orders.filter((o) => o.complete);

      return {
        code: link.code,
        count: completedOrders.length,
        revenue: completedOrders.reduce((a, b) => a + b.ambassador_revenue, 0),
      };
    });
  }

  @Get('checkout/links/:code')
  async link(@Param('code') code: string) {
    return this.linksService.findOne({
      where: { code },
      relations: ['user', 'products'],
    });
  }
}
