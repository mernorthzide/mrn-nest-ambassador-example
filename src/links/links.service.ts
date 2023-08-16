import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/shared/abstract.service';
import { Link } from './entities/link.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LinksService extends AbstractService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {
    super(linkRepository);
  }
}
