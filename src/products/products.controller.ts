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

@ApiTags('Products')
@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne({
      where: { id: +id },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // Generate fake data
  @Get('generate-fake-data/:number')
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
    console.log(
      '🚀 ~ file: products.controller.ts:93 ~ ProductsController ~ backEnd ~ products:',
      products,
    );

    if (!products) {
      products = await this.productsService.findAll();

      await this.cacheManager.set('products_backend', products, {
        ttl: 1800,
      } as any);
    }

    return products;
  }
}
