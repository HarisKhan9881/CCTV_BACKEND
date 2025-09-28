import { Injectable } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

type IdType = string | number;

export type PageResult<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class OrmDbHelperService {

  constructor(private readonly dataSource: DataSource) {
  }

  private repo<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    manager?: EntityManager,
  ): Repository<T> {
    return (manager ?? this.dataSource).getRepository<T>(entity);
  }

  async createOne<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    dto: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const repo = this.repo(entity, manager);
    const obj = repo.create(dto);
    return repo.save(obj);
  }

  async findById<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    id: IdType,
    options?: Omit<FindOneOptions<T>, 'where'>,
    manager?: EntityManager,
  ): Promise<T | null> {
    const repo = this.repo(entity, manager);
    return repo.findOne({ ...(options ?? {}), where: { id } as any });
  }

  async exists<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.repo(entity, manager);
    const count = await repo.count({ where });
    return count > 0;
  }

  async count<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    where?: FindOptionsWhere<T>,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.repo(entity, manager);
    return repo.count({ where });
  }

  async updateById<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    id: IdType,
    patch: QueryDeepPartialEntity<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const repo = this.repo(entity, manager);
    await repo.update(id as any, patch);
    const fresh = await this.findById(entity, id, undefined, manager);
    if (!fresh) throw new Error(`${repo.metadata.name}(${id}) not found after update`);
    return fresh;
  }

  async save<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    dto: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const repo = this.repo(entity, manager);
    return repo.save(dto as any);
  }

  async paginate<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    options: FindManyOptions<T> & { page?: number; limit?: number },
    manager?: EntityManager,
  ): Promise<PageResult<T>> {
    const repo = this.repo(entity, manager);
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(Math.max(1, options.limit ?? 20), 200);

    const [data, total] = await repo.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }


}
