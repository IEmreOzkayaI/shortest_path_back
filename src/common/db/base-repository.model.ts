import { Request } from 'express';
import { DataSource, EntityManager, Repository, ObjectType } from 'typeorm';

export const ENTITY_MANAGER_KEY = 'ENTITY_MANAGER';

export class BaseRepository<T> {
  constructor(
    private dataSource: DataSource,
    private request: Request,
    private entityClass: ObjectType<T>,
  ) {}

  protected get repository(): Repository<T> {
    const entityManager: EntityManager =
      this.request[ENTITY_MANAGER_KEY] ?? this.dataSource.manager;
    return entityManager.getRepository(this.entityClass);
  }
}
