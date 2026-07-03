import { PrismaClient } from '@prisma/client';
import prisma from '../prisma/client';

export abstract class BaseRepository<TEntity, TId> {
  protected db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  public abstract findById(id: TId): Promise<TEntity | null>;
  public abstract findAll(filters?: any): Promise<TEntity[]>;
  public abstract create(entity: Partial<TEntity>): Promise<TEntity>;
  public abstract update(id: TId, entity: Partial<TEntity>): Promise<TEntity>;
  public abstract delete(id: TId): Promise<boolean>;
}

export default BaseRepository;
