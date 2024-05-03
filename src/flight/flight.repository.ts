import { InjectDataSource } from '@nestjs/typeorm';
import { Flight } from './flight.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { BaseRepository } from '../common/db/base-repository.model';
import { DataSource } from 'typeorm';

import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class FlightRepository extends BaseRepository<Flight> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @Inject(REQUEST) request: Request,
  ) {
    super(dataSource, request, Flight);
  }

  async findUniqueFlights(): Promise<Flight[]> {
    return await this.repository.find();
  }
}
