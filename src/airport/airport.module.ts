import { Global, Module } from '@nestjs/common';
import { AirportService } from './airport.service';
import { AirportController } from './airport.controller';
import { AirportRepository } from './airport.repository';

@Global()
@Module({
  providers: [AirportService, AirportRepository],
  exports: [AirportService],
  controllers: [AirportController],
})
export class AirportModule {}
