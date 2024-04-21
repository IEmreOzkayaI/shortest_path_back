import { Injectable } from '@nestjs/common';
import { FlightRepository } from './flight.repository';
import { Flight } from './flight.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FlightService {
  constructor(
    private readonly flightRepository: FlightRepository,
    private readonly logger: PinoLogger,
  ) {}

  async findUniqueFlights(): Promise<Flight[]> {
    this.logger.info('Finding unique flights');
    return await this.flightRepository.findUniqueFlights();
  }
}
