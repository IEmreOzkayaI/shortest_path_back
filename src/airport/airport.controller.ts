import { Controller, Get } from '@nestjs/common';
import { AirportService } from './airport.service';

@Controller({
  path: 'airports',
  version: '1',
})
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Get()
  async findAll() {
    return this.airportService.findAllStated();
  }

  @Get('/:code')
  async findByCode(code: string) {
    return this.airportService.findByCode(code);
  }
}
