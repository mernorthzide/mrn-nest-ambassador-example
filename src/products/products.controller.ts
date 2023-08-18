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
  async backEnd() {
    let products = await this.cacheManager.get('products_backend');

    if (!products) {
      products = await this.productsService.findAll();

      await this.cacheManager.set('products_backend', products, {
        ttl: 1800,
      } as any);
    }

    return products;
  }
}
