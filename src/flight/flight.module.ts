import { Global, Module } from '@nestjs/common';
import { FlightRepository } from './flight.repository';
import { FlightService } from './flight.service';

@Global()
@Module({
  exports: [FlightService],
  providers: [FlightService, FlightRepository],
})
export class FlightModule {}
