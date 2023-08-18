import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Inject,
  Res,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(AuthGuard)
  @Post('admin/products')
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);

    // Emit event
    this.eventEmitter.emit('product_updated');

    return product;
  }

  @UseGuards(AuthGuard)
  @Get('admin/products')
  findAll() {
    return this.productsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('admin/products/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne({
      where: { id: +id },
    });
  }

  @UseGuards(AuthGuard)
  @Patch('admin/products/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.productsService.update(+id, updateProductDto);

    // Emit event
    this.eventEmitter.emit('product_updated');

    return this.productsService.findOne({
      where: { id: +id },
    });
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  async remove(@Param('id') id: string) {
    const response = await this.productsService.remove(+id);

    // Emit event
    this.eventEmitter.emit('product_updated');

    return response;
  }

  // Generate fake data
  @UseGuards(AuthGuard)
  @Get('admin/products/generate-fake-data/:number')
  async generateFakeData(@Param('number') number: number) {
    // Create products
    for (let i = 0; i < number; i++) {
      await this.productsService.create({
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        image: faker.image.imageUrl(200, 200, '', true),
        price: faker.commerce.price(),
      });
    }

    return {
      message: number + ' products created',
    };
  }

  @CacheKey('products_frontend')
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  async frontEnd() {
    return this.productsService.findAll();
  }

  @Get('ambassador/products/backend')
  async backEnd(@Query() query) {
    // Get products from cache
    let products = await this.cacheManager.get<Product[]>('products_backend');

    // If not found in cache
    if (!products) {
      // Get products from database
      products = await this.productsService.findAll();

      // Set products to cache
      await this.cacheManager.set('products_backend', products, {
        ttl: 1800,
      } as any);
    }

    // Search
    if (query.s) {
      const s = query.s.toString().toLowerCase();

      products = products.filter((product) => {
        return (
          product.title.toLowerCase().includes(s) ||
          product.description.toLowerCase().includes(s)
        );
      });
    }

    // Sort by price
    if (query.sort) {
      const sort = query.sort.toString().toLowerCase();

      if (sort === 'asc') {
        products = products.sort((a, b) => {
          return a.price - b.price;
        });
      } else if (sort === 'desc') {
        products = products.sort((a, b) => {
          return b.price - a.price;
        });
      }
    }

    // Pagination
    const total = products.length;
    const page = query.page ? parseInt(query.page.toString()) : 1;
    const limit = query.limit ? parseInt(query.limit.toString()) : 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    products = products.slice(startIndex, endIndex);

    return {
      total,
      page,
      last_page: Math.ceil(total / limit),
      data: products,
    };
  }
}
