import { Injectable } from '@nestjs/common';
import { Airport } from './airport.entity';
import { AirportRepository } from './airport.repository';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AirportService {
  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly logger: PinoLogger,
  ) {}

  async findAllStated(): Promise<any> {
    this.logger.info('Finding all airports');
    const airports = await this.airportRepository.findAll();
    // Group airports by state
    const groupedByState = airports.reduce((acc, airport) => {
      if (!acc[airport.state]) {
        acc[airport.state] = [];
      }
      acc[airport.state].push(airport);
      return acc;
    }, {});

    return groupedByState;
  }

  async findAll(): Promise<Airport[]> {
    this.logger.info('Finding all airports');
    return await this.airportRepository.findAll();
  }

  async findByCode(code: string): Promise<Airport> {
    this.logger.info(`Finding airport with code ${code}`);
    return await this.airportRepository.findByCode(code);
  }
}
