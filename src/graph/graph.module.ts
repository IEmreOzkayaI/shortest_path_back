import { Module } from '@nestjs/common';
import { AirportModule } from 'src/airport/airport.module';
import { FlightModule } from 'src/flight/flight.module';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';

@Module({
  imports: [AirportModule, FlightModule],
  controllers: [GraphController],
  providers: [GraphService],
})
export class GraphModule {}
