import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { SharedModule } from 'src/shared/shared.module';
import { ProductListener } from './listeners/product.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), SharedModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductListener],
})
export class ProductsModule {}
