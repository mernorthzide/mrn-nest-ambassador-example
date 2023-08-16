import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { AbstractService } from 'src/shared/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService extends AbstractService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {
    super(productsRepository);
  }
}
