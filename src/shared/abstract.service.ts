import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  create(options: any) {
    return this.repository.save(options);
  }

  findAll(options?: FindManyOptions<any>) {
    return this.repository.find(options);
  }

  findOne(options: FindOneOptions<any>) {
    return this.repository.findOne(options);
  }

  update(id: number, options: any) {
    return this.repository.update(id, options);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
