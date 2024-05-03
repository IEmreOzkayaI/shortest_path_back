import { InjectDataSource } from '@nestjs/typeorm';
import { Airport } from './airport.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { BaseRepository } from '../common/db/base-repository.model';
import { DataSource } from 'typeorm';

import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class AirportRepository extends BaseRepository<Airport> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @Inject(REQUEST) request: Request,
  ) {
    super(dataSource, request, Airport);
  }

  async findAll(): Promise<Airport[]> {
    return await this.repository.find();
  }

  async findByCode(code: string): Promise<Airport> {
    return await this.repository.findOne({ where: { iata_code: code } });
  }
}
